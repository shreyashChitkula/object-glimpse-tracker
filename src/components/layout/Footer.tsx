import React from "react";
import { Link } from "react-router-dom";
import { Camera, Github, ExternalLink } from "lucide-react";

export function Footer() {
  const developers = [
    {
      name: "Shreyash",
      github: "https://github.com/shreyashChitkula",
    },
    {
      name: "Sai Teja",
      github: "https://github.com/saitejaMaryala",
    },
    {
      name: "Saloni Goyal",
      github: "https://github.com/Saloni-go",
    },
    {
      name: "Aryan Mishra",
      github: "https://github.com/aryanmishra777",
    },
    {
      name: "Neha Murthy",
      github: "https://github.com/nmuser818",
    },
  ];

  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">ObjectTracker</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Real-time object detection and tracking in adverse weather
              conditions.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/auth?mode=register"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Register
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium">Team 29</h3>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <span>Aryan Mishra</span>
              <span>Ch Shreyash</span>
              <span>Neha Murthy</span>
              <span>Saiteja</span>
              <span>Saloni Goyal</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ObjectTracker. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by{" "}
              {developers.map((dev, index) => (
                <span key={dev.name}>
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    {dev.name}
                  </a>
                  {index < developers.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <a
              href="https://github.com/DASS-Spring-2025/dass-spring-2025-project-team-29"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
