import { Activity, Lightbulb, BarChart3, Shield, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Sensor-powered posture detection",
    description: "Embedded force sensors and on-device machine learning detect slouching, leaning, and asymmetrical sitting patterns.",
    icon: <Activity className="h-6 w-6" />
  },
  {
    title: "Gentle ambient cues",
    description: "Choose between subtle haptics, lighting changes, or other ambient signals that make you aware of your posture without breaking focus.",
    icon: <Lightbulb className="h-6 w-6" />
  },
  {
    title: "Behavioral insights over time",
    description: "View posture history, streaks, and personalized insights so you can see how your habits are changing over weeks—not just minutes.",
    icon: <BarChart3 className="h-6 w-6" />
  },
  {
    title: "Comfort-first design",
    description: "A soft, low-profile pad that sits on your chair—no straps across your shoulders, no rigid back braces, nothing taped to your body.",
    icon: <Shield className="h-6 w-6" />
  },
  {
    title: "Built for the modern home office",
    description: "Planned integrations with laptops, smart bulbs (like Philips Hue), and voice assistants to make posture feedback part of your broader home setup.",
    icon: <Share2 className="h-6 w-6" />
  },
  {
    title: "Evidence- and feedback-backed",
    description: "Shaped by 20+ user interviews and emerging research on digital therapeutics and sedentary work, with a build-in-public roadmap that incorporates real-world feedback.",
    icon: <Lightbulb className="h-6 w-6" />
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need for healthier sitting
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg bg-background border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}