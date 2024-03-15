import Navbar from "@/components/navbar/Navbar";

import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import { DataProvider } from '../context/Context';
import { RunningProvider } from '../context/RunningContext'
import {AuthProvider} from '@/context/AuthContext'
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Text Speech Convert",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            <RunningProvider>
              <div className="container">
                <div className="wrapper">
                  <Navbar />
                  {children}
                  {/* <Footer /> */}
                </div>
              </div>
            </RunningProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
