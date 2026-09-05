import React from 'react';
import { Info, Cpu, Code, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">About MeriYatra</h1>
        <p className="text-lg md:text-xl text-gray-600">
          A community project to make your daily bus journeys <strong className="text-red-600">easy and reliable</strong>.
        </p>
      </div>

      <div className="space-y-8">
        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Info className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            MeriYatra helps you track your local city buses in real-time, right from your phone. 
            No more waiting endlessly at the bus stop—now you can see exactly where your bus is 
            and when it will arrive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Cpu className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Hardware</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed text-base">
              We install simple, reliable GPS trackers on buses that send live location updates securely to our system.
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Technology</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed text-base">
              Our platform is designed to be extremely fast and easy to use on any smartphone, ensuring you get accurate bus timings when you need them most.
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 text-center bg-gradient-to-br from-red-50 to-amber-50 border-amber-100">
          <Lightbulb className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Future Scope</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We are working on bringing more buses and routes to the app. In the future, MeriYatra will help you plan your complete journey and alert you if your bus is running late.
          </p>
        </div>
      </div>
    </div>
  );
}
