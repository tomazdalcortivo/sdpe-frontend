import React from "react";
import { ArrowUpRight, Calendar, Users } from "lucide-react";

export function ProjectCard({ project }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">

      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
            {project.category}
          </span>
        </div>

        <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/20 transition-colors duration-500" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {project.title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Info & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>24 vagas</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>2024</span>
            </div>
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"
          >
            <ArrowUpRight className="w-5 h-5 transform group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
