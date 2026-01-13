import React from "react";
import { projects } from "../lib/data";
import { ProjectCard } from "./ProjectCard";
import { Filter } from "lucide-react";

export function FeaturedProjects() {
    const categories = ["Todos", "Tecnologia", "Saúde", "Meio Ambiente", "Educação", "Cultura"];

    return (
        <section id="projetos" className="py-24 bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-emerald-600 font-semibold tracking-wide uppercase text-sm mb-3">
                            Nossos Projetos
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Explore iniciativas que estão <br />
                            mudando o mundo ao nosso redor.
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filtrar
                        </button>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mb-12">
                    {categories.map((cat, idx) => (
                        <button
                            key={cat}
                            type="button"
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${idx === 0
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                    : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {/* View All Button */}
                <div className="mt-16 text-center">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center px-8 py-3 border border-emerald-200 text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-colors duration-300"
                    >
                        Ver Todos os Projetos
                    </button>
                </div>

            </div>
        </section>
    );
}