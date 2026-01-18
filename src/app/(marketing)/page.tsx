"use client";

import Link from "next/link";
import {
  QrCode,
  BookOpen,
  Repeat,
  Gauge,
  Languages,
  TrendingUp,
  School,
  Users,
  FileText,
  CheckCircle2,
  Play,
  Headphones,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Book Voice</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">
                功能特色
              </a>
              <a href="#scenarios" className="text-slate-600 hover:text-blue-600 transition-colors">
                使用场景
              </a>
              <a href="#school" className="text-slate-600 hover:text-blue-600 transition-colors">
                学校方案
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-slate-600 hover:text-blue-600 transition-colors">
                登录
              </Link>
              <Link
                href="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                免费试用
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                K12英语听力学习平台
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                扫码即听
                <br />
                <span className="text-blue-600">轻松掌握</span>
                英语听力
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                配套教材音频，QR码快速访问。支持变速播放、AB复读、进度追踪，让K12学生的英语听力练习更高效。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  立即开始
                </Link>
                <a
                  href="#school"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-lg font-semibold border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <School className="w-5 h-5" />
                  学校批量订阅
                </a>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-slate-900">10,000+</div>
                  <div className="text-sm text-slate-500">学生用户</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">100+</div>
                  <div className="text-sm text-slate-500">合作学校</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500">配套教材</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-3xl p-8">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-slate-400" />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-lg font-semibold text-slate-900 mb-1">扫描课本二维码</div>
                    <div className="text-sm text-slate-500">立即跳转到对应音频课程</div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">核心功能</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              专为K12学生设计的强大功能，让英语听力学习更高效
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "QR码快速访问",
                description: "扫描课本二维码，立即跳转到对应课程音频，无需搜索查找",
                color: "blue",
              },
              {
                icon: Repeat,
                title: "AB复读练习",
                description: "设置起点和终点，反复播放难点片段，支持自动循环和手动标记",
                color: "orange",
              },
              {
                icon: Gauge,
                title: "变速播放",
                description: "0.5x-2.0x速度调节，初学者可减速，进阶练习可加速",
                color: "purple",
              },
              {
                icon: Languages,
                title: "同步字幕",
                description: "中英双语字幕实时显示，点击句子即可跳转播放位置",
                color: "green",
              },
              {
                icon: TrendingUp,
                title: "学习进度追踪",
                description: "自动记录学习时长、完成课程数、连续学习天数等数据",
                color: "pink",
              },
              {
                icon: BookOpen,
                title: "多教材支持",
                description: "支持人教版、外研社等主流教材，覆盖小学到高中全学段",
                color: "teal",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Scenarios */}
      <section id="scenarios" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">适用场景</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              满足课堂教学、家庭作业、考试备考等多种学习需求
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "课堂教学辅助",
                description: "教师可在课堂上播放音频，学生扫码同步学习，支持集体练习和个人练习",
                items: ["投屏播放", "学生同步跟读", "课堂互动练习"],
              },
              {
                title: "家庭作业练习",
                description: "学生在家完成听力作业，家长可查看学习进度和完成情况",
                items: ["自主学习", "进度追踪", "家长监督"],
              },
              {
                title: "考试备考冲刺",
                description: "针对性练习薄弱环节，AB复读反复训练，提高听力应试能力",
                items: ["专项训练", "模拟考试", "错题重练"],
              },
              {
                title: "通勤碎片学习",
                description: "上下学路上、等车时间，随时随地利用碎片时间练习听力",
                items: ["离线缓存", "断点续播", "后台播放"],
              },
            ].map((scenario, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-8 border border-slate-200"
              >
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{scenario.title}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{scenario.description}</p>
                <div className="flex flex-wrap gap-2">
                  {scenario.items.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Subscription */}
      <section id="school" className="py-20 px-4 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">学校批量订阅方案</h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                为学校提供定制化订阅服务，支持批量导入学生账号，统一管理，按学期计费
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "批量导入学生账号（Excel表格）",
                  "统一默认密码，首次登录强制修改",
                  "按学期自定义订阅时长",
                  "班级管理和学习报告导出",
                  "专属客服支持",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
                    <span className="text-blue-50">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <School className="w-5 h-5" />
                联系我们了解详情
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">订阅流程</h3>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "提交学校信息",
                    description: "填写学校名称、联系方式、学生人数",
                  },
                  {
                    step: "2",
                    title: "上传学生名单",
                    description: "使用Excel模板批量导入学生信息",
                  },
                  {
                    step: "3",
                    title: "系统生成账号",
                    description: "自动创建学生账号并分配默认密码",
                  },
                  {
                    step: "4",
                    title: "开始使用",
                    description: "学生登录后修改密码即可开始学习",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                      <div className="text-sm text-slate-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">强大的播放器功能</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              专业级音频播放器，满足各种学习需求
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">变速播放</h3>
              <p className="text-slate-600 mb-4">
                支持0.5x、0.75x、1.0x、1.25x、1.5x、2.0x六档速度调节，保持音调不变
              </p>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">播放速度</span>
                  <span className="text-sm font-semibold text-blue-600">1.0x</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-8 border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Repeat className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AB复读</h3>
              <p className="text-slate-600 mb-4">
                手动设置或点击字幕自动设置循环区间，反复播放直到完全掌握
              </p>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">A: 0:45</span>
                  <span className="text-xs text-orange-600 font-semibold">循环 3次</span>
                  <span className="text-xs text-slate-500">B: 1:20</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute left-1/4 right-1/2 h-full bg-orange-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-8 border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">同步字幕</h3>
              <p className="text-slate-600 mb-4">
                支持英文、中文、双语三种显示模式，点击任意句子即可跳转播放
              </p>
              <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
                <div className="text-sm text-slate-900">Hello, how are you?</div>
                <div className="text-xs text-slate-500">你好，你好吗？</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Analytics */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">学习数据可视化</h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                详细的学习统计和进度追踪，帮助学生和家长了解学习情况
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: TrendingUp,
                    title: "学习时长统计",
                    description: "每日、每周、每月学习时长统计，可视化学习趋势",
                  },
                  {
                    icon: CheckCircle2,
                    title: "完成率追踪",
                    description: "课程完成情况、完成率统计，清晰了解学习进度",
                  },
                  {
                    icon: Users,
                    title: "连续学习天数",
                    description: "记录连续学习天数，激励学生保持学习习惯",
                  },
                  {
                    icon: FileText,
                    title: "学习报告导出",
                    description: "支持导出Excel格式学习报告，方便教师和家长查看",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                      <div className="text-sm text-slate-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">本周学习时长</span>
                    <span className="text-2xl font-bold text-slate-900">12.5小时</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">完成课程</span>
                    <span className="text-2xl font-bold text-slate-900">28/50</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">连续学习</span>
                    <span className="text-2xl font-bold text-slate-900">15天</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded ${i < 5 ? "bg-orange-400" : "bg-slate-100"}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">准备好开始学习了吗？</h2>
          <p className="text-xl text-slate-600 mb-8">
            加入数千名正在使用Book Voice提高英语听力的学生
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              免费开始
            </Link>
            <a
              href="#school"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <School className="w-5 h-5" />
              学校批量订阅
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Book Voice</span>
              </div>
              <p className="text-sm">K12英语听力学习平台</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-blue-400 transition-colors">
                    功能特色
                  </a>
                </li>
                <li>
                  <a href="#scenarios" className="hover:text-blue-400 transition-colors">
                    使用场景
                  </a>
                </li>
                <li>
                  <a href="#school" className="hover:text-blue-400 transition-colors">
                    学校方案
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">支持</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    帮助中心
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    联系我们
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    常见问题
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">法律</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    隐私政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    服务条款
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Book Voice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
