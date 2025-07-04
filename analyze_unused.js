#!/usr/bin/env node

// Script para analizar archivos no utilizados en el frontend
const fs = require('fs');
const path = require('path');

// Lista de todos los componentes UI disponibles
const allUIComponents = [
    'accordion', 'alert-dialog', 'alert', 'aspect-ratio', 'avatar', 'badge', 
    'breadcrumb', 'button', 'calendar', 'card', 'carousel', 'chart', 'checkbox', 
    'collapsible', 'command', 'context-menu', 'dialog', 'drawer', 'dropdown-menu', 
    'form', 'hover-card', 'input-otp', 'input', 'label', 'menubar', 'navigation-menu', 
    'pagination', 'popover', 'progress', 'radio-group', 'resizable', 'scroll-area', 
    'select', 'separator', 'sheet', 'shelf-grid', 'sidebar', 'skeleton', 'slider', 
    'sonner', 'switch', 'table', 'tabs', 'textarea', 'toast', 'toaster', 
    'toggle-group', 'toggle', 'tooltip', 'use-toast'
];

// Lista de todas las páginas disponibles
const allPages = [
    'AdminTareasPage', 'Dashboard', 'Index', 'Login', 'MapPage', 'NotFound', 
    'Products', 'Profile', 'ReponedorAlertas', 'ReponedorDashboard', 'ReponedoresPage', 
    'ReponedorMapPage', 'ReponedorProfile', 'ReponedorSemanal', 'ReponedorTareas', 
    'Reportes', 'RutasPage', 'SupervisorDashboard', 'SupervisorMapPage', 
    'SupervisorProfile', 'SupervisorTareas', 'TareasPage', 'Users'
];

// Función para buscar uso de componentes en archivos
function findUsageInFiles(searchTerm, directory) {
    const results = [];
    
    function searchInFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(`@/components/ui/${searchTerm}`) || 
                content.includes(`from "./components/ui/${searchTerm}`) ||
                content.includes(`import * from`) && content.includes(searchTerm)) {
                results.push(filePath);
            }
        } catch (error) {
            // Ignorar errores de lectura
        }
    }
    
    function walkDirectory(dir) {
        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    walkDirectory(filePath);
                } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                    searchInFile(filePath);
                }
            });
        } catch (error) {
            // Ignorar errores de directorio
        }
    }
    
    walkDirectory(directory);
    return results;
}

console.log('Analizando componentes UI no utilizados...\n');

const srcPath = path.join(__dirname, 'src');
const unusedComponents = [];

allUIComponents.forEach(component => {
    const usage = findUsageInFiles(component, srcPath);
    if (usage.length === 0) {
        unusedComponents.push(component);
    }
});

console.log('=== COMPONENTES UI NO UTILIZADOS ===');
unusedComponents.forEach(component => {
    console.log(`- ${component}.tsx`);
});

console.log(`\nTotal de componentes no utilizados: ${unusedComponents.length}`);
console.log(`Total de componentes: ${allUIComponents.length}`);
console.log(`Porcentaje de uso: ${((allUIComponents.length - unusedComponents.length) / allUIComponents.length * 100).toFixed(1)}%`);
