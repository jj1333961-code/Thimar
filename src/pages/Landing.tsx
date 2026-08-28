import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader } from "lucide-react";
import logo from "@/assets/logo.svg";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the teacher app
    window.location.href = "/app.html";
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" dir="rtl">
      <div className="max-w-5xl mx-auto relative px-4">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="ثمار"
            width={64}
            height={64}
            className="rounded-lg mb-8 mt-24"
          />
        </div>
        <div className="flex items-center justify-center text-foreground">
          <Loader className="h-8 w-8 animate-spin mr-4 shrink-0" />
          <span className="text-base">جاري فتح المنصة...</span>
        </div>
      </div>
    </div>
  );
}
