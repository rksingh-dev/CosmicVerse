import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  MessageCircle,
  Music,
  ExternalLink,
  Users,
  Activity,
  Globe,
  ArrowRight,
  Play,
  Monitor,
  Zap,
  Star,
  Clock,
  Shield,
  Sparkles,
  File,
} from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  const apps = [
    {
      title: "Video Chat",
      description:
        "High-quality WebRTC video calling with crystal clear communication. Connect with anyone, anywhere in the world.",
      url: "https://webrtcbyrahul.vercel.app",
      icon: Video,
      gradient: "from-blue-600 to-blue-700",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      features: ["HD Video Quality", "Real-time Communication", "Secure P2P"],
      stats: "10,000+ Calls",
      category: "Communication",
    },
    {
      title: "Text Chat",
      description:
        "Lightning-fast real-time messaging powered by WebSocket technology. Join conversations instantly.",
      url: "https://rahulverse.vercel.app/",
      icon: MessageCircle,
      gradient: "from-emerald-600 to-emerald-700",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      features: ["Real-time Messaging", "WebSocket Tech", "Instant Delivery"],
      stats: "50,000+ Messages",
      category: "Communication",
    },
    {
      title: "Music Streaming",
      description:
        "Ad-free music streaming experience powered by YouTube API. Discover and enjoy unlimited music.",
      url: "https://rahulfm.vercel.app/",
      icon: Music,
      gradient: "from-purple-600 to-purple-700",
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      features: ["Ad-free Experience", "YouTube Integration", "High Quality"],
      stats: "100,000+ Songs",
      category: "Entertainment",
    },
    {
      title: "FileForge",
      description:
        "Architected a client-side image compression system achieving 70% size reduction while maintaining 95% visual quality, with support for batch processing and drag-and-drop functionality. Implemented a robust image-to-PDF conversion engine featuring multi-image merging, customizable page layouts, and quality preservation with real-time preview.",
      url: "https://fileforgebyrahul.vercel.app/",
      icon: File,
      gradient: "from-orange-600 to-orange-700",
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      features: ["Image Compression", "PDF Conversion", "Batch Processing"],
      stats: "10,000+ Files Processed",
      category: "Tools",
    },
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "50+" },
    { icon: Activity, label: "Total Sessions", value: "500,000+" },
    { icon: Globe, label: "Countries", value: "40+" },
    { icon: Clock, label: "Uptime", value: "99.9%" },
  ];

  useEffect(() => {
    // Performance optimization: Use requestAnimationFrame for smooth entrance
    const frameId = requestAnimationFrame(() => {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleAppLaunch = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Elegant Background Elements */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-muted/10 smooth-transform" />

        {/* Floating geometric shapes with optimized animations */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float-gentle opacity-60 smooth-transform"
          style={{
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-muted/20 to-transparent rounded-full blur-3xl animate-float-gentle opacity-40 smooth-transform"
          style={{
            animationDelay: "2.5s",
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-3xl animate-float-gentle opacity-50 smooth-transform"
          style={{
            animationDelay: "5s",
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] smooth-transform"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "42px 42px",
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="relative section-padding ultra-smooth-container">
          {/* Subtle radial gradient for focus */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-muted/10 pointer-events-none smooth-transform" />
          <div className="container mx-auto px-4 ultra-smooth-container">
            <div
              className={`max-w-4xl mx-auto text-center transition-all duration-1000 ease-out ${isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
                }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Welcome to Rahulverse
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-6 tracking-tight">
                Rahul
                <span className="text-gradient bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
                  verse
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                Your comprehensive digital platform for{" "}
                <span className="font-semibold text-foreground">
                  video calling
                </span>
                ,{" "}
                <span className="font-semibold text-foreground">
                  real-time chat
                </span>
                , and{" "}
                <span className="font-semibold text-foreground">
                  music streaming
                </span>
                . All in one beautifully crafted experience.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="glass-card p-6 rounded-2xl hover-lift animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Apps Section */}
        <section className="section-padding section-overlay ultra-smooth-container">
          <div className="container mx-auto px-4 ultra-smooth-container">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Platform Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our suite of applications designed to enhance your
                digital communication and entertainment experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {apps.map((app, index) => (
                <Card
                  key={app.title}
                  className="group relative overflow-hidden hover-lift glass-card cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                  onClick={() => handleAppLaunch(app.url)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-2xl ${app.iconBg} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <app.icon className={`w-8 h-8 ${app.iconColor}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {app.category}
                      </Badge>
                    </div>

                    <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {app.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {app.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Features */}
                      <div className="space-y-2">
                        {app.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Usage</span>
                          <span className="font-medium text-foreground">
                            {app.stats}
                          </span>
                        </div>
                      </div>

                      {/* Launch Button */}
                      <Button
                        className={`w-full bg-gradient-to-r ${app.gradient} hover:opacity-90 text-white font-semibold btn-professional group/btn`}
                      >
                        <Play className="w-4 h-4 mr-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        Launch Application
                        <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="section-padding ultra-smooth-container">
          <div className="container mx-auto px-4 ultra-smooth-container">
            <div className="max-w-4xl mx-auto text-center">
              <Card className="glass-card p-12 hover-lift subtle-glow">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
                    <Monitor className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Now Available
                    </span>
                  </div>

                  <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                    Movie Streaming
                  </h2>

                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Experience cinema like never before with our upcoming movie
                    streaming platform. High-quality content, seamless playback,
                    and an ad-free experience.
                  </p>

                  {/* Coming Soon Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        icon: Star,
                        title: "4K Quality",
                        desc: "Ultra HD streaming",
                      },
                      {
                        icon: Shield,
                        title: "Ad-free",
                        desc: "Uninterrupted viewing",
                      },
                      {
                        icon: Zap,
                        title: "Fast Loading",
                        desc: "Instant playback",
                      },
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-muted/50 border border-border"
                      >
                        <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold text-foreground mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:opacity-90 text-white font-semibold btn-professional group"
                    size="lg"
                    onClick={() => handleAppLaunch("https://rahulflix.vercel.app/")}
                  >
                    <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Watch Movies
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Built with passion by{" "}
                <span className="font-semibold text-foreground">Rahul</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Powered by modern web technologies
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
