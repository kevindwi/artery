// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Field,
//   FieldDescription,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { Loader2 } from "lucide-react";
// import { signUp } from "@/lib/auth-client";
// import { toast } from "sonner";
// import { useNavigate } from "@tanstack/react-router";

// export function SignupForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {
//   const navigate = useNavigate();

//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   // const [passwordConfirmation, setPasswordConfirmation] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     await signUp.email({
//       email,
//       password,
//       name: fullName,
//       callbackURL: "/",
//       fetchOptions: {
//         onResponse: () => {
//           setLoading(false);
//         },
//         onRequest: () => {
//           setLoading(true);
//         },
//         onError: (ctx) => {
//           toast.error(ctx.error.message);
//         },
//         onSuccess: async () => {
//           navigate({ to: "/" });
//         },
//       },
//     });
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader className="text-center">
//           <CardTitle className="text-xl">Create your account</CardTitle>
//           <CardDescription>
//             Enter your email below to create your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form>
//             <FieldGroup>
//               <Field>
//                 <FieldLabel htmlFor="name">Full Name</FieldLabel>
//                 <Input
//                   id="name"
//                   type="text"
//                   placeholder="John Doe"
//                   required
//                   onChange={(e) => {
//                     setFullName(e.target.value);
//                   }}
//                   value={fullName}
//                 />
//               </Field>
//               <Field>
//                 <FieldLabel htmlFor="email">Email</FieldLabel>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   required
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                   }}
//                   value={email}
//                 />
//               </Field>
//               <Field>
//                 <Field>
//                   <FieldLabel htmlFor="password">Password</FieldLabel>
//                   <Input
//                     id="password"
//                     type="password"
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     autoComplete="new-password"
//                     placeholder="Password"
//                   />
//                 </Field>
//                 <FieldDescription>
//                   Must be at least 8 characters long.
//                 </FieldDescription>
//               </Field>
//               <Field>
//                 <Button type="submit" disabled={loading} onClick={handleSubmit}>
//                   {loading ? (
//                     <Loader2 size={16} className="animate-spin" />
//                   ) : (
//                     "Create an account"
//                   )}
//                 </Button>
//                 <FieldDescription className="text-center">
//                   Already have an account? <a href="/login">Sign in</a>
//                 </FieldDescription>
//               </Field>
//             </FieldGroup>
//           </form>
//         </CardContent>
//       </Card>
//       <FieldDescription className="px-6 text-center">
//         By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
//         and <a href="#">Privacy Policy</a>.
//       </FieldDescription>
//     </div>
//   );
// }
