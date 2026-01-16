"use client";

import Link from "next/link";
import { Play, BookOpen, Headphones, QrCode, BarChart3, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-teal-900">Book Voice</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
            >
              功能特色
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
            >
              使用方法
            </a>
            <a
              href="#testimonials"
              className="text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
            >
              用户评价
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-600 hover:text-teal-600 transition-colors">
              登录
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              立即开始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                K12 英语听力学习平台
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                随时随地
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500">
                  练听力
                </span>
                轻松提高英语
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                扫描课本二维码，即刻获取配套音频。 追踪学习进度，AB复读练习，轻松掌握英语听力技能。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  免费开始学习
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-slate-200 hover:border-teal-300 hover:text-teal-600 transition-all cursor-pointer"
                >
                  了解使用方法
                </a>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">10000+</div>
                  <div className="text-sm text-slate-500">学生用户</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-500">音频课程</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500">配套教材</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-br from-teal-50 to-orange-50 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">第三单元 - 第2课</div>
                      <div className="text-sm text-slate-500">人教版英语 五年级</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-500">0:45</span>
                      <span className="text-sm text-slate-500">2:30</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>
                    <button className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <Play className="w-7 h-7 ml-1" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              掌握英语听力所需的一切功能
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              专为 K12 学生设计的强大功能，让英语学习变得有趣又高效。
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "扫码即听",
                description: "扫描课本二维码，立即跳转到对应音频课程，无需搜索。",
                color: "from-teal-400 to-teal-500",
              },
              {
                icon: Play,
                title: "AB复读练习",
                description: "设置起点和终点，反复播放难点片段，直到完全掌握。",
                color: "from-orange-400 to-orange-500",
              },
              {
                icon: Headphones,
                title: "变速播放",
                description: "初学者可减速至0.5倍，进阶练习可加速至2倍。",
                color: "from-purple-400 to-purple-500",
              },
              {
                icon: BookOpen,
                title: "同步字幕",
                description: "中英双语字幕同步显示，点击任意句子即可跳转播放。",
                color: "from-blue-400 to-blue-500",
              },
              {
                icon: BarChart3,
                title: "进度追踪",
                description: "查看学习统计、连续学习天数和完成率，保持学习动力。",
                color: "from-green-400 to-green-500",
              },
              {
                icon: Smartphone,
                title: "多端同步",
                description: "手机、平板、电脑均可使用，学习进度自动同步。",
                color: "from-pink-400 to-pink-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-50 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              简单三步，开始学习
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              上手简单，一分钟内即可开始学习。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "扫描二维码",
                description: "打开课本，用手机扫描课程旁边的二维码。",
              },
              {
                step: "02",
                title: "听音频学习",
                description: "音频即刻播放，可使用字幕、调节速度、AB复读练习。",
              },
              {
                step: "03",
                title: "追踪进度",
                description: "学习进度自动保存，随时查看统计数据，持续进步。",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-6xl font-bold text-teal-100 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-teal-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              深受学生和家长喜爱
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">看看用户们怎么说。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "女儿的英语听力进步很大！她很喜欢自己扫码练习，学习主动性提高了很多。",
                name: "王女士",
                role: "四年级学生家长",
              },
              {
                quote: "AB复读功能太好用了，遇到难发音的地方可以反复听，每天放学后都会用。",
                name: "李明",
                role: "六年级学生",
              },
              {
                quote: "终于有一款和课本完全配套的工具了，学生们的听力练习积极性比以前高多了。",
                name: "张老师",
                role: "英语教师",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-orange-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好提高英语听力了吗？</h2>
            <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
              加入数千名正在使用 Book Voice 学习的学生。 今天就免费开始吧。
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-teal-50 transition-colors shadow-lg cursor-pointer"
            >
              <Play className="w-5 h-5" />
              免费开始
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Book Voice</span>
              </div>
              <p className="text-sm">让 K12 学生的英语听力练习变得简单有趣。</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    功能特色
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    使用方法
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors cursor-pointer">
                    价格方案
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">支持</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors cursor-pointer">
                    帮助中心
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors cursor-pointer">
                    联系我们
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors cursor-pointer">
                    常见问题
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">法律</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors cursor-pointer">
                    隐私政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors cursor-pointer">
                    服务条款
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Book Voice. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
