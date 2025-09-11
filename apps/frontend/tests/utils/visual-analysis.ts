import { Page, Locator } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

export interface VisualAnalysisResult {
  timestamp: string;
  url: string;
  viewport: { width: number; height: number };
  performance: PerformanceMetrics;
  accessibility: AccessibilityIssue[];
  colors: ColorPalette;
  animations: AnimationDetails[];
  components: ComponentAnalysis[];
}

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  domContentLoaded: number;
  loadComplete: number;
}

export interface AccessibilityIssue {
  type: string;
  element: string;
  issue: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface ColorPalette {
  primary: string[];
  background: string[];
  text: string[];
  accent: string[];
  contrasts: ContrastRatio[];
}

export interface ContrastRatio {
  foreground: string;
  background: string;
  ratio: number;
  passes: { aa: boolean; aaa: boolean };
}

export interface AnimationDetails {
  selector: string;
  duration: string;
  timing: string;
  keyframes: string;
}

export interface ComponentAnalysis {
  name: string;
  selector: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  styles: Record<string, string>;
  interactive: boolean;
}

export class VisualAnalyzer {
  constructor(private page: Page) {}

  async captureFullAnalysis(): Promise<VisualAnalysisResult> {
    const [performance, accessibility, colors, animations, components] = await Promise.all([
      this.analyzePerformance(),
      this.analyzeAccessibility(),
      this.analyzeColors(),
      this.analyzeAnimations(),
      this.analyzeComponents()
    ]);

    const viewport = this.page.viewportSize() || { width: 1920, height: 1080 };

    return {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      viewport,
      performance,
      accessibility,
      colors,
      animations,
      components
    };
  }

  async analyzePerformance(): Promise<PerformanceMetrics> {
    return await this.page.evaluate(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = window.performance.getEntriesByType('paint');
      
      return {
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would need PerformanceObserver for accurate LCP
        timeToInteractive: perfData.domInteractive - perfData.fetchStart,
        totalBlockingTime: 0, // Would need Long Task API
        cumulativeLayoutShift: 0, // Would need Layout Instability API
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart
      };
    });
  }

  async analyzeAccessibility(): Promise<AccessibilityIssue[]> {
    return await this.page.evaluate(() => {
      const issues: AccessibilityIssue[] = [];

      // Check images for alt text
      document.querySelectorAll('img').forEach(img => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push({
            type: 'image',
            element: img.outerHTML.substring(0, 100),
            issue: 'Missing alt text',
            severity: 'serious'
          });
        }
      });

      // Check buttons for labels
      document.querySelectorAll('button').forEach(button => {
        if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
          issues.push({
            type: 'button',
            element: button.outerHTML.substring(0, 100),
            issue: 'Missing accessible label',
            severity: 'serious'
          });
        }
      });

      // Check form inputs for labels
      document.querySelectorAll('input, select, textarea').forEach(input => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        
        if (!label && !ariaLabel) {
          issues.push({
            type: 'form',
            element: input.outerHTML.substring(0, 100),
            issue: 'Input missing label',
            severity: 'serious'
          });
        }
      });

      // Check heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let lastLevel = 0;
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (lastLevel > 0 && level - lastLevel > 1) {
          issues.push({
            type: 'heading',
            element: heading.outerHTML.substring(0, 100),
            issue: `Skipped heading level from H${lastLevel} to H${level}`,
            severity: 'moderate'
          });
        }
        lastLevel = level;
      });

      return issues;
    });
  }

  async analyzeColors(): Promise<ColorPalette> {
    return await this.page.evaluate(() => {
      const getColorFromElement = (element: Element): string => {
        const style = window.getComputedStyle(element);
        return style.color || 'rgb(0, 0, 0)';
      };

      const getBackgroundColor = (element: Element): string => {
        const style = window.getComputedStyle(element);
        return style.backgroundColor || 'rgb(255, 255, 255)';
      };

      const getLuminance = (rgb: string): number => {
        const matches = rgb.match(/\d+/g);
        if (!matches) return 0;
        const [r, g, b] = matches.map(Number);
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      const getContrastRatio = (color1: string, color2: string): number => {
        const l1 = getLuminance(color1);
        const l2 = getLuminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      // Collect unique colors
      const colorSet = new Set<string>();
      const bgColorSet = new Set<string>();
      const textColorSet = new Set<string>();

      document.querySelectorAll('*').forEach(element => {
        const color = getColorFromElement(element);
        const bgColor = getBackgroundColor(element);
        
        if (color !== 'rgb(0, 0, 0)') textColorSet.add(color);
        if (bgColor !== 'rgba(0, 0, 0, 0)') bgColorSet.add(bgColor);
        
        colorSet.add(color);
        colorSet.add(bgColor);
      });

      // Calculate contrast ratios for common combinations
      const contrasts: ContrastRatio[] = [];
      const bodyColor = getColorFromElement(document.body);
      const bodyBg = getBackgroundColor(document.body);
      
      const ratio = getContrastRatio(bodyColor, bodyBg);
      contrasts.push({
        foreground: bodyColor,
        background: bodyBg,
        ratio,
        passes: {
          aa: ratio >= 4.5,
          aaa: ratio >= 7
        }
      });

      // Check heading contrasts
      document.querySelectorAll('h1, h2, h3').forEach(heading => {
        const hColor = getColorFromElement(heading);
        const hBg = getBackgroundColor(heading.parentElement || heading);
        const hRatio = getContrastRatio(hColor, hBg);
        
        contrasts.push({
          foreground: hColor,
          background: hBg,
          ratio: hRatio,
          passes: {
            aa: hRatio >= 3, // Large text
            aaa: hRatio >= 4.5
          }
        });
      });

      return {
        primary: Array.from(colorSet).slice(0, 5),
        background: Array.from(bgColorSet).slice(0, 5),
        text: Array.from(textColorSet).slice(0, 5),
        accent: [], // Would need more sophisticated detection
        contrasts
      };
    });
  }

  async analyzeAnimations(): Promise<AnimationDetails[]> {
    return await this.page.evaluate(() => {
      const animations: AnimationDetails[] = [];
      const styleSheets = Array.from(document.styleSheets);

      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          
          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const style = rule.style;
              if (style.animation || style.transition) {
                animations.push({
                  selector: rule.selectorText,
                  duration: style.animationDuration || style.transitionDuration || '',
                  timing: style.animationTimingFunction || style.transitionTimingFunction || '',
                  keyframes: style.animationName || ''
                });
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets will throw
        }
      });

      return animations;
    });
  }

  async analyzeComponents(): Promise<ComponentAnalysis[]> {
    return await this.page.evaluate(() => {
      const components: ComponentAnalysis[] = [];
      const componentSelectors = [
        { name: 'Button', selector: 'button' },
        { name: 'Card', selector: '.glass-card, .card' },
        { name: 'Input', selector: 'input, textarea' },
        { name: 'Navigation', selector: 'nav' },
        { name: 'Header', selector: 'header' },
        { name: 'Table', selector: 'table' }
      ];

      componentSelectors.forEach(({ name, selector }) => {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          components.push({
            name,
            selector,
            boundingBox: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            styles: {
              display: styles.display,
              position: styles.position,
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              padding: styles.padding,
              margin: styles.margin,
              border: styles.border,
              borderRadius: styles.borderRadius,
              boxShadow: styles.boxShadow
            },
            interactive: element.tagName === 'BUTTON' || 
                        element.tagName === 'A' || 
                        element.tagName === 'INPUT' ||
                        !!element.onclick
          });
        }
      });

      return components;
    });
  }

  async captureScreenshotSeries(prefix: string, count: number = 5, delay: number = 1000): Promise<string[]> {
    const screenshots: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const filename = `tests/screenshots/${prefix}-${i}.png`;
      await this.page.screenshot({ path: filename, fullPage: true });
      screenshots.push(filename);
      
      if (i < count - 1) {
        await this.page.waitForTimeout(delay);
      }
    }
    
    return screenshots;
  }

  async compareThemes(): Promise<{light: VisualAnalysisResult; dark: VisualAnalysisResult}> {
    // Capture light theme
    await this.page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await this.page.waitForTimeout(500);
    const lightAnalysis = await this.captureFullAnalysis();
    
    // Capture dark theme
    await this.page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await this.page.waitForTimeout(500);
    const darkAnalysis = await this.captureFullAnalysis();
    
    return { light: lightAnalysis, dark: darkAnalysis };
  }

  async generateReport(analysis: VisualAnalysisResult): Promise<void> {
    const reportPath = path.join('tests', 'reports', `visual-analysis-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(analysis, null, 2));
    
    console.log(`Visual analysis report saved to: ${reportPath}`);
    console.log('\nSummary:');
    console.log(`- Performance FCP: ${analysis.performance.firstContentfulPaint}ms`);
    console.log(`- Accessibility Issues: ${analysis.accessibility.length}`);
    console.log(`- Color Contrasts Passing AA: ${analysis.colors.contrasts.filter(c => c.passes.aa).length}/${analysis.colors.contrasts.length}`);
    console.log(`- Animations Found: ${analysis.animations.length}`);
    console.log(`- Components Analyzed: ${analysis.components.length}`);
  }
}

export async function runVisualAnalysis(page: Page): Promise<VisualAnalysisResult> {
  const analyzer = new VisualAnalyzer(page);
  const analysis = await analyzer.captureFullAnalysis();
  await analyzer.generateReport(analysis);
  return analysis;
}