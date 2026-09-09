import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { env } from "cloudflare:workers";
import { defaults, type InviteContent } from "../page";
import AdminEditor from "./admin-editor";
export const dynamic="force-dynamic";
async function load():Promise<InviteContent>{try{const r=await env.DB.prepare("SELECT content FROM invitation_content WHERE id=1").first<{content:string}>();return r?.content?{...defaults,...JSON.parse(r.content)}:defaults}catch{return defaults}}
export default async function Admin(){const user=await requireChatGPTUser("/admin");const content=await load();return <main className="admin-shell"><header className="admin-head"><div><h1>Admin Undangan</h1><small>{user.email}</small></div><div><a href="/" target="_blank">Lihat website</a> · <a href={chatGPTSignOutPath("/")}>Keluar</a></div></header><AdminEditor initial={content}/></main>}
