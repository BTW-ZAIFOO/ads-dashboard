"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" defaultValue="user@example.com" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="company">Company Name</Label>
                <Input type="text" id="company" defaultValue="Acme Corp" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="UTC">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Default Campaign Settings</h3>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="defaultBudget">Default Daily Budget</Label>
                <Input type="number" id="defaultBudget" defaultValue="100" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Defaults</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="emailNotifs" className="rounded border-gray-300" defaultChecked />
                <Label htmlFor="emailNotifs">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="budgetAlerts" className="rounded border-gray-300" defaultChecked />
                <Label htmlFor="budgetAlerts">Budget Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="performanceAlerts" className="rounded border-gray-300" defaultChecked />
                <Label htmlFor="performanceAlerts">Performance Alerts</Label>
              </div>
              <Button>Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Billing Information</h3>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input type="text" id="cardName" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input type="text" id="cardNumber" placeholder="**** **** **** ****" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input type="text" id="expiry" placeholder="MM/YY" />
                </div>
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input type="text" id="cvc" placeholder="123" />
                </div>
              </div>
              <Button>Update Payment Method</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">API Keys</h3>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex space-x-2">
                  <Input type="text" id="apiKey" value="sk_test_123456789" readOnly className="flex-1" />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <Button variant="outline">Generate New Key</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}