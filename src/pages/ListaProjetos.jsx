import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { projects } from "../lib/data";

export function ProjectsList({ onProjectClick }) {
    const [searchTerm, setSearchTerm] = useState("");
    const categories = ["Todos", "Tecnologia", "Saúde", "Meio Ambiente", "Educação", "Cultura"];
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === "Todos" || project.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Todos os Projetos
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore todos os projetos de extensão cadastrados na plataforma
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar projetos..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                    : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                                        {project.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {project.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {project.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => onProjectClick(project.id)}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-full hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Saiba Mais
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">Nenhum projeto encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}
