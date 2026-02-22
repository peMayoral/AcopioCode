/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Compras from './pages/Compras';
import Dashboard from './pages/Dashboard';
import DetalleCompra from './pages/DetalleCompra';
import DetalleVenta from './pages/DetalleVenta';
import EditarCompra from './pages/EditarCompra';
import EditarVenta from './pages/EditarVenta';
import GastosExtraordinarios from './pages/GastosExtraordinarios';
import NuevaCompra from './pages/NuevaCompra';
import NuevaVenta from './pages/NuevaVenta';
import Stock from './pages/Stock';
import Vencimientos from './pages/Vencimientos';
import Ventas from './pages/Ventas';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Compras": Compras,
    "Dashboard": Dashboard,
    "DetalleCompra": DetalleCompra,
    "DetalleVenta": DetalleVenta,
    "EditarCompra": EditarCompra,
    "EditarVenta": EditarVenta,
    "GastosExtraordinarios": GastosExtraordinarios,
    "NuevaCompra": NuevaCompra,
    "NuevaVenta": NuevaVenta,
    "Stock": Stock,
    "Vencimientos": Vencimientos,
    "Ventas": Ventas,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};