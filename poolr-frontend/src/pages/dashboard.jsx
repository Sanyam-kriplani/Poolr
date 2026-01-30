import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import {
  Search,
  ShieldCheck,
  IndianRupee,
  Route,
  Car,
  User,
  List,
  Bookmark,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function HomeDashboard() {
    const navigate=useNavigate();


  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="bg-primary/10 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center space-y-6">
          <h1 className="text-4xl font-bold">
            Your pick of rides at low prices
          </h1>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Travel smart. Share rides. Save money.
          </p>

          {/* Primary Search CTA */}
          <Button size="lg" className="px-10" onClick={()=>{navigate("/search-ride")}}>
            <Search className="mr-2 h-5 w-5" />
            Search a Ride
          </Button>
        </div>
      </section>

      {/* QUICK NAV ACTIONS */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <NavCard
              icon={<User />}
              title="My Profile"
              desc="View & update your personal details"
              action="Open Profile"
              onClick={()=>{navigate("/my-profile")}}
            />
            <NavCard
              icon={<Car />}
              title="Publish a Ride"
              desc="Offer a ride and save on travel"
              action="Publish Ride"
              onClick={()=>{navigate("/publish-ride")}}
            />
            <NavCard
              icon={<List />}
              title="My Published Rides"
              desc="Manage rides you have posted"
              action="View Rides"
              onClick={()=>{navigate("/my-published-rides")}}
            />
            <NavCard
              icon={<Bookmark />}
              title="My Past Bookings"
              desc="See rides you have taken"
              action="View Bookings"
              onClick={()=>{navigate("/my-bookings")}}
            />
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-16 bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-3">
          <ValueCard
            icon={<Route />}
            title="Travel everywhere"
            desc="Explore carpool rides across cities."
          />
          <ValueCard
            icon={<IndianRupee />}
            title="Prices like nowhere"
            desc="Share costs and save every trip."
          />
          <ValueCard
            icon={<ShieldCheck />}
            title="Ride with confidence"
            desc="Verified profiles and trusted riders."
          />
        </div>
      </section>

      {/* SHARE RIDE CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <h2 className="text-3xl font-bold">
                Share your ride. Cut your costs.
              </h2>
              <p className="max-w-xl opacity-90">
                Turn empty seats into savings by sharing your ride.
              </p>
              <Button variant="default" onClick={()=>{navigate("/publish-ride")}}>
                <Car className="mr-2 h-4 w-4"  />
                Publish a Ride
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SAFETY */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Help us keep you safe from scams
            </h2>
            <p className="text-muted-foreground">
              Learn how to avoid and report suspicious activity.
            </p>
            <Button>
              Learn more
            </Button>
          </div>

          <Card>
            <CardContent className="flex items-center justify-center p-10">
              <ShieldCheck className="h-20 w-20 text-primary" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* HELP CENTRE */}
      <section className="py-16 bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 space-y-10">
          <h2 className="text-3xl font-bold text-center">
            Carpool Help Centre
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <HelpItem title="How do I book a ride?" />
            <HelpItem title="How do I publish a ride?" />
            <HelpItem title="How do I cancel my booking?" />
            <HelpItem title="What are the benefits of carpooling?" />
          </div>

          <div className="text-center">
            <Button variant="outline">
              Read our Help Centre
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Components ---------- */

function NavCard({ icon, title, desc, action, highlight, onClick }) {
  return (
    <Card
      className={`hover:shadow-md transition ${
        highlight ? "border-primary" : ""
      }`}
    >
      <CardHeader>
        <div className="h-8 w-8 text-primary">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{desc}</p>
        <Button variant={highlight ? "default" : "outline"} className="w-full" onClick={onClick}>
          {action}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <Card>
      <CardHeader>
        <div className="h-10 w-10 text-primary">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        {desc}
      </CardContent>
    </Card>
  );
}

function HelpItem({ title }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium">
        <HelpCircle className="h-4 w-4 text-primary" />
        {title}
      </div>
      <Separator />
      <p className="text-sm text-muted-foreground">
        Short explanation goes here. Click to read more.
      </p>
    </div>
  );
}