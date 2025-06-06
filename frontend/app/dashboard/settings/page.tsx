"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserRound, Moon, Sun, BellRing, ShieldAlert, Languages, HelpCircle, Bot } from "lucide-react"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [aiTrading, setAiTrading] = useState(false)
  const [language, setLanguage] = useState("English")

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-6">Account Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <UserRound className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">Profile Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Update your account's profile information</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="display-name" className="block text-sm font-medium mb-1">Display Name</label>
                  <input 
                    type="text" 
                    id="display-name"
                    defaultValue="Astra User"
                    className="w-full p-2 rounded-md border border-border bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    defaultValue="user@example.com"
                    className="w-full p-2 rounded-md border border-border bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-orange-500/10">
              <ShieldAlert className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage your account's security settings</p>
              
              <div className="space-y-4">
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-6">Application Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              {darkMode ? (
                <Moon className="h-6 w-6 text-blue-500" />
              ) : (
                <Sun className="h-6 w-6 text-yellow-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-1">Appearance</h3>
                  <p className="text-sm text-muted-foreground">Toggle between dark and light mode</p>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => setDarkMode(false)}
                    className={`p-2 rounded-l-md border border-r-0 border-border ${!darkMode ? 'bg-accent' : 'bg-background'}`}
                  >
                    <Sun className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setDarkMode(true)}
                    className={`p-2 rounded-r-md border border-border ${darkMode ? 'bg-accent' : 'bg-background'}`}
                  >
                    <Moon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-violet-500/10">
              <BellRing className="h-6 w-6 text-violet-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-1">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive trading and platform notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <Bot className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-1">AI-Powered Trading</h3>
                  <p className="text-sm text-muted-foreground">Enable AI to make trading decisions on your behalf</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={aiTrading} 
                    onChange={() => setAiTrading(!aiTrading)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              {aiTrading && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm">AI Trading is now <strong>enabled</strong>. Astra will analyze market conditions and execute trades according to your risk profile.</p>
                  <Button size="sm" variant="outline" className="mt-2">Configure AI Settings</Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-pink-500/10">
              <Languages className="h-6 w-6 text-pink-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-1">Language</h3>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="p-2 rounded-md border border-border bg-background"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-blue-500/10">
            <HelpCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-1">Help & Support</h3>
            <p className="text-sm text-muted-foreground mb-4">Get help with your account and the Astra DeFi platform</p>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Documentation</Button>
              <Button variant="outline">Contact Support</Button>
              <Button variant="outline">FAQ</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
