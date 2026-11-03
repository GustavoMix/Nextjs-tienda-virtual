// ⚠️ PROTOTIPO: este "login" NO es seguro. Solo guarda una marca en el navegador
// para poder ver el panel. Cualquiera que conozca /admin puede entrar.
// Cuando conectes Supabase, reemplaza estas 3 funciones por Supabase Auth:
//   signIn  -> supabase.auth.signInWithPassword({ email, password })
//   signOut -> supabase.auth.signOut()
//   getUser -> (await supabase.auth.getUser()).data.user
// y protege las tablas con RLS para que solo el admin pueda escribir.

const KEY = "admin-demo";

export type AdminUser = { email: string };

export async function signIn(email: string, password: string): Promise<AdminUser> {
  if (!email || !password) throw new Error("Escribe tu correo y contraseña.");
  const user = { email };
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {}
  return user;
}

export async function signOut() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export async function getUser(): Promise<AdminUser | null> {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as AdminUser) : null;
  } catch {
    return null;
  }
}
