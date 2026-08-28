import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FolderGit2,
  GitBranch,
  Search,
  FileCode2,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseGitHubUrl } from "@/lib/github";

export default function Landing() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError("يرجى إدخال رابط مستودع GitHub صحيح");
      return;
    }

    navigate(
      `/browse/${parsed.owner}/${parsed.repo}?branch=${parsed.branch}`,
    );
  };

  const features = [
    {
      icon: FileCode2,
      title: "تصفح الملفات",
      description: "استعرض هيكل المستودع كاملاً مع عرض محتوى كل ملف",
    },
    {
      icon: Search,
      title: "بحث سريع",
      description: "تجول بين المجلدات والملفات بسرعة وسهولة",
    },
    {
      icon: Shield,
      title: "آمن وخصوصي",
      description: "لا يتم حفظ أي بيانات. يعمل مباشرة مع GitHub API",
    },
  ];

  const examples = [
    "facebook/react",
    "vercel/next.js",
    "microsoft/TypeScript",
    "vuejs/core",
  ];

  return (
    <div className="min-h-screen flex flex-col thimmar-pattern" dir="rtl">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 border border-primary/15">
              <FolderGit2 className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                المستودع
              </h1>
              <p className="text-xs text-muted-foreground">
                استكشف ملفات أي مستودع
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 thimmar-hero-bg">
          <div className="w-full max-w-2xl">
            {/* Logo / Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="flex items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-sm">
                  <FolderGit2 className="size-10 text-primary" />
                </div>
                <div className="absolute -bottom-1.5 -left-1.5 flex items-center justify-center size-7 rounded-lg bg-card border border-border shadow-sm">
                  <GitBranch className="size-3.5 text-primary" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                استخرج المستودع
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto">
                تصفح ملفات أي مستودع على GitHub بسهولة — بدون الحاجة لتهيئة
                أي شيء
              </p>
            </motion.div>

            {/* URL Input Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="w-full"
            >
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError("");
                      }}
                      placeholder="الصق رابط المستودع هنا... (مثال: facebook/react)"
                      className="pl-4 pr-10 h-14 text-base bg-card border-border/70 shadow-sm rounded-xl focus-visible:ring-primary/30 focus-visible:border-primary/40"
                      dir="ltr"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
                  >
                    <ArrowLeft className="size-4 ml-2" />
                    استكشف
                  </Button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm mt-2 mr-1"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.form>

            {/* Quick examples */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-5"
            >
              <span className="text-xs text-muted-foreground">
                جرّب أحد هذه:
              </span>
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setUrl(ex);
                    setError("");
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/40 transition-all cursor-pointer font-mono hover:shadow-sm"
                  dir="ltr"
                >
                  {ex}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border/50 bg-card/40">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                لماذا المستودع؟
              </h3>
              <p className="text-sm text-muted-foreground">
                أداة بسيطة وقوية لتصفح ملفات البرمجيات
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="thimmar-card flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
                >
                  <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 mb-4 border border-primary/10">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border/50">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                كيف يعمل؟
              </h3>
              <p className="text-sm text-muted-foreground">
                ثلاث خطوات بسيطة لاستكشاف أي مستودع
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {[
                {
                  step: "١",
                  icon: Globe,
                  title: "الصق الرابط",
                  desc: "انسخ رابط أي مستودع من GitHub والصقه في حقل البحث",
                },
                {
                  step: "٢",
                  icon: Search,
                  title: "استعرض الهيكل",
                  desc: "يتم عرض شجرة الملفات والمجلدات بشكل تسلسلي",
                },
                {
                  step: "٣",
                  icon: Zap,
                  title: "اقرأ المحتوى",
                  desc: "اضغط على أي ملف لعرض محتواه فوراً",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-1 w-full"
                >
                  <div className="thimmar-card relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                        {item.step}
                      </div>
                      <item.icon className="size-5 text-primary/60" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            المستودع — أداة مجانية لتصفح ملفات GitHub
          </p>
        </div>
      </footer>
    </div>
  );
}
