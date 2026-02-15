"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle, ArrowLeft, Shield, Key } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HostVerificationPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pinFields, setPinFields] = useState(["", "", "", "", "", "", "", ""])

  // Clear any existing verification on mount for security
  useEffect(() => {
    sessionStorage.removeItem("hostVerified")
  }, [])

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[a-zA-Z0-9@!#$%^&*]$/.test(value) || value === "") {
      const newPinFields = [...pinFields]
      newPinFields[index] = value
      setPinFields(newPinFields)
      setPin(newPinFields.join(""))

      // Auto-focus next input
      if (value !== "" && index < 7) {
        const nextInput = document.querySelector(`input[name="pin-${index + 1}"]`) as HTMLInputElement
        if (nextInput) nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinFields[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="pin-${index - 1}"]`) as HTMLInputElement
      if (prevInput) {
        prevInput.focus()
        e.preventDefault()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || pin.length !== 8) {
      setError("Please enter all 8 characters of the PIN")
      return
    }

    setIsSubmitting(true)
    setError("")

    // Hardcoded PIN verification with animation delay
    setTimeout(() => {
      if (pin === "S@f3T!m9") {
        sessionStorage.setItem("hostVerified", "true")
        router.push("/dashboard/organizer/host")
      } else {
        setError("Invalid PIN. Please try again.")
        setPinFields(["", "", "", "", "", "", "", ""])
        setPin("")
        const firstInput = document.querySelector('input[name="pin-0"]') as HTMLInputElement
        if (firstInput) firstInput.focus()
        setIsSubmitting(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="space-y-1 pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-center">Host Event Access</CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4 text-indigo-500" />
              <p>Secure Access Required</p>
            </div>
            <p className="text-sm text-slate-600 text-center mt-2">
              Enter the 8-character PIN to access host features
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {pinFields.map((value, index) => (
                  <Input
                    key={index}
                    type="text"
                    name={`pin-${index}`}
                    value={value}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-center text-lg font-semibold bg-slate-50 border-2 focus:border-indigo-500 focus:ring-indigo-500"
                    maxLength={1}
                    autoComplete="off"
                  />
                ))}
              </div>

              {error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Verify PIN
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}