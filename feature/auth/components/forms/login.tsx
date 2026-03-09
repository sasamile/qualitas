"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { authApi } from "../../api/auth";
import { permissionsApi } from "../../api/permissions";
import { loginSchema, LoginSchema } from "../../schemas";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { AuthLayout } from "../shared/auth-layout";
import Link from "next/link";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenant: "root",
    },
  });

  async function onSubmit(values: LoginSchema) {
    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.login(
        { email: values.email, password: values.password },
        values.tenant || "root",
      );

      if (!response?.accessToken || !response?.refreshToken) {
        throw new Error("Respuesta inválida del servidor");
      }

      const store = useAuthStore.getState();
      store.login(response.accessToken, response.refreshToken);

      try {
        store.setLoadingPermissions(true);
        store.setPermissionError(null);

        const permissions = await permissionsApi.getUserPermissions(
          response.accessToken,
        );

        store.setPermissions(permissions || []);
      } catch (permErr) {
        console.warn("[AUTH] Permisos no cargados:", permErr);
        store.setPermissions([]);
      } finally {
        store.setLoadingPermissions(false);
      }

      await new Promise((r) => setTimeout(r, 0));
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión. Por favor verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Iniciar Sesión" description="Accede a tu cuenta">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="m@ejemplo.com"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <Input
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-9"
                      {...field}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <div className="text-right text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

        
          {error && (
            <div className="text-sm text-red-500 font-medium text-center">
              {error}
            </div>
          )}


          <Button
            size="lg"
            className="w-full bg-linear-to-b from-[#5490f1] to-[#0757d8] hover:to-[#276cdb] transition-colors duration-300 text-white"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Iniciar Sesión
          </Button>


          <div className="text-center text-xs text-gray-400 pt-4">
            © 2026 Qualitas • All rights reserved
          </div>

        </form>
      </Form>
    </AuthLayout>
  );
}