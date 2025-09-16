"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface AuthConfigurationAlertProps {
  title?: string
  description?: string
  showSetupGuide?: boolean
}

export function AuthConfigurationAlert({ 
  title = "Authentication Not Configured",
  description = "The authentication service is not properly configured. Please set up Supabase to enable user authentication features.",
  showSetupGuide = true
}: AuthConfigurationAlertProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      {showSetupGuide && (
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              To enable authentication features, you need to:
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Create a Supabase project</li>
                <li>Get your project URL and API key</li>
                <li>Add them to your .env.local file</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                Go to Supabase Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Continue Without Authentication
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function AuthConfigurationBanner() {
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Disabled</AlertTitle>
      <AlertDescription>
        User authentication is not configured. Some features may be limited.
        <Link href="https://supabase.com/dashboard" className="ml-2 underline" target="_blank" rel="noopener noreferrer">
          Set up Supabase
        </Link>
      </AlertDescription>
    </Alert>
  )
}