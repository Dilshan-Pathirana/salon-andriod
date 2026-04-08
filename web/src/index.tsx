import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";

registerSW({ immediate: true });

const savedTheme = window.localStorage.getItem('salon_theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
document.documentElement.classList.toggle('dark', useDark)

createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);

