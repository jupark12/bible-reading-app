import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getTodayDevotional } from "~/lib/utils";

interface LoginPageProps {
  checkAuth: () => Promise<boolean>;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentDevotional: React.Dispatch<React.SetStateAction<Devotional | null>>;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  checkAuth,
  setLoggedIn,
  setCurrentDevotional,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Remove the console.log for production
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          email: email.trim(),
        }),
      });

      if (response.ok) {
        await getTodayDevotional(setCurrentDevotional);

        setLoggedIn(true);
        checkAuth();
      } else {
        const data = await response.json();
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Bible Reading App
          </CardTitle>
          <CardDescription className="text-center">
            {isRegistering
              ? "Create a new account"
              : "Login to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={isRegistering}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={isRegistering}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={isRegistering}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}

            {!isRegistering ? (
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={isLoading}
                onClick={async (e: React.FormEvent) => {
                  e.preventDefault();
                  setIsLoading(true);
                  setError("");
                  if (
                    !username ||
                    !password ||
                    !email ||
                    !firstName ||
                    !lastName
                  ) {
                    setError("Please fill in all fields to register");
                    return;
                  }

                  setIsLoading(true);
                  setError("");

                  try {
                    const response = await fetch(
                      "http://localhost:8000/auth/register",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          username,
                          password,
                          email,
                          first_name: firstName,
                          last_name: lastName,
                        }),
                      },
                    );

                    if (response.ok) {
                      setError("");
                      setIsRegistering(false);
                      // Auto-login after successful registration
                      await handleLogin({
                        preventDefault: () => {},
                      } as React.FormEvent);
                    } else {
                      const data = await response.json();
                      setError(data.message || "Registration failed");
                    }
                  } catch (error) {
                    setError(
                      "An error occurred during registration. Please try again.",
                    );
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-4">
          <Button
            variant="link"
            className="w-full"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
