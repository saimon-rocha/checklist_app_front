import { redirect } from "next/navigation";
import "../styles/App.css";

export default function Home() {
  redirect("/login");
}