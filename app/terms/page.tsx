import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, AlertTriangle, Scale, Users } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
        </div>

        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Agreement to Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using aithletiq, you agree to be bound by these Terms of Service and all applicable laws
              and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Accounts and Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per person is allowed</li>
                  <li>You must be at least 13 years old to create an account</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">User Conduct</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Use the service only for lawful purposes</li>
                  <li>Respect other users and maintain a positive community</li>
                  <li>Do not share inappropriate or harmful content</li>
                  <li>Do not attempt to hack or disrupt the service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Health and Safety Disclaimer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Health Notice</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  aithletiq provides fitness and nutrition information for educational purposes only. Always consult
                  with healthcare professionals before starting any exercise or diet program.
                </p>
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>We are not responsible for any injuries or health issues</li>
                <li>Exercise at your own risk and within your capabilities</li>
                <li>Stop exercising if you experience pain or discomfort</li>
                <li>Our AI recommendations are not medical advice</li>
                <li>Individual results may vary</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance may temporarily affect availability</li>
                <li>We reserve the right to modify or discontinue features</li>
                <li>Emergency maintenance may occur without prior notice</li>
                <li>We are not liable for any losses due to service interruptions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Our Content</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>All app content, including text, graphics, and code, is our property</li>
                    <li>Exercise videos and demonstrations are licensed or created by us</li>
                    <li>You may not copy, distribute, or modify our content without permission</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Your Content</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>You retain ownership of content you create and share</li>
                    <li>You grant us license to use your content to provide our services</li>
                    <li>You are responsible for ensuring you have rights to shared content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>We provide the service "as is" without warranties</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid for the service</li>
                <li>We are not responsible for third-party content or services</li>
                <li>Some jurisdictions may not allow these limitations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">By You</h4>
                  <p className="text-muted-foreground">
                    You may terminate your account at any time through the app settings or by contacting us.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">By Us</h4>
                  <p className="text-muted-foreground mb-2">We may terminate accounts for:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Violation of these terms</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Extended periods of inactivity</li>
                    <li>Technical or security reasons</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via
                email or app notification. Continued use of the service after changes constitutes acceptance of the new
                terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">For questions about these terms, please contact us:</p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: legal@aithletiq.com</p>
                <p>Address: 123 Fitness Street, Health City, HC 12345</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">These terms are effective immediately and supersede all previous versions.</p>
        </div>
      </div>
    </div>
  )
}
