import { useState } from 'react'
import { Search, Sparkles, Settings } from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'

interface SearchFormProps {
  onSearch: (prompt: string) => void
  loading: boolean
  disabled?: boolean
}

export function SearchForm({ onSearch, loading, disabled }: SearchFormProps) {
  const [prompt, setPrompt] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !loading) {
      onSearch(prompt.trim())
    }
  }

  const exampleQueries = [
    'Dentists in Columbia, SC with no chat widget',
    'Restaurants in Nashville without online ordering',
    'Law firms in Austin with outdated websites',
    'Hair salons in Miami with no booking system'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          Search for Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Search Input */}
          <div className="space-y-2">
            <label htmlFor="search-prompt" className="text-body font-medium">
              Describe the leads you&apos;re looking for
            </label>
            <div className="relative">
              <Textarea
                id="search-prompt"
                placeholder="e.g., 'dentists in Columbia, SC with no chat widget and high reviews'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] pr-12 resize-none"
                disabled={disabled}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="h-8 px-2"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Example Queries */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Try these examples:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={disabled}
                >
                  &quot;{example}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options (Hidden by default) */}
          {showAdvanced && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Advanced Options</h4>
              <div className="text-sm text-gray-500">
                Advanced filtering options will be available in a future update.
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {prompt.length}/500 characters
            </div>
            <Button 
              type="submit" 
              disabled={!prompt.trim() || loading || disabled}
              size="lg"
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Leads
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}