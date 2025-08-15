// Функция для форматирования цены с пробелами
function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU').replace(/\s/g, ' ');
}

// Функция для форматирования даты в нужном формате
function formatDateForDisplay(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} | ${hours}:${minutes}`;
}

// Переменные для элементов
// Переменные themeToggle и themeIcon будут объявлены в main_page.js
let backToMainBtn;

// Переменные для статистики
const totalSales = document.getElementById('total_sales');
const totalRevenue = document.getElementById('total_revenue');
const avgCheck = document.getElementById('avg_check');
const totalProducts = document.getElementById('total_products');
const warehouseItems = document.getElementById('warehouse_items');
const lowStock = document.getElementById('low_stock');
const topSeller = document.getElementById('top_seller');
const topCategory = document.getElementById('top_category');
const activityLevel = document.getElementById('activity_level');
const profit = document.getElementById('profit');
const profitability = document.getElementById('profitability');
const trend = document.getElementById('trend');

function deduplicateDeleteHistory(deleteHistory) {
    const map = new Map();
    for (const item of deleteHistory) {
        // Ключ — уникальное сочетание товара (можно добавить больше полей при необходимости)
        const key = [item.productName, item.productType, item.productGender, item.productPrice, item.productImage, item.date.slice(0,16)].join('|');
        if (map.has(key)) {
            const existing = map.get(key);
            existing.quantity += item.quantity;
        } else {
            map.set(key, { ...item });
        }
    }
    return Array.from(map.values());
}

// Загрузка данных отчётов
function loadReportsData() {
    const reportsTable = document.querySelector('.reports_table tbody');
    if (!reportsTable) return;

    // Очищаем таблицу
    reportsTable.innerHTML = '';

    // Получаем данные из localStorage
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    const warehouseHistory = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
    const deleteHistoryRaw = JSON.parse(localStorage.getItem('deleteHistory') || '[]');
    const deleteHistory = deduplicateDeleteHistory(deleteHistoryRaw);
    const addHistory = JSON.parse(localStorage.getItem('addHistory') || '[]');
    const returnHistory = JSON.parse(localStorage.getItem('returnHistory') || '[]');
    
    // Объединяем все записи и добавляем тип действия
    const allActions = [];
    
    salesHistory.forEach(sale => {
        allActions.push({
            ...sale,
            actionType: 'Продано',
            actionClass: 'sold'
        });
    });
    
    warehouseHistory.forEach(item => {
        allActions.push({
            ...item,
            actionType: 'Складировано',
            actionClass: 'warehoused'
        });
    });
    
    deleteHistory.forEach(item => {
        allActions.push({
            ...item,
            actionType: 'Удалено',
            actionClass: 'deleted'
        });
    });
    
    addHistory.forEach(item => {
        allActions.push({
            ...item,
            actionType: 'Добавлено',
            actionClass: 'added'
        });
    });
    
    returnHistory.forEach(item => {
        allActions.push({
            ...item,
            actionType: 'Возвращено в продажу',
            actionClass: 'returned'
        });
    });

    // Сортируем по дате (новые сначала)
    allActions.sort((a, b) => new Date(b.date) - new Date(a.date));

    let reportNumber = 1;

    // Отображаем все действия в хронологическом порядке
    allActions.forEach(action => {
        const row = createReportRow(
            reportNumber++, 
            action.productImage || action.image, 
            action.productName || action.name, 
            action.productPrice || action.price || action.pricePerUnit, 
            action.quantity, 
            action.productGender || action.gender || 'Не указан', 
            action.productType || action.type, 
            action.actionType, 
            action.actionClass, 
            action.date
        );
        reportsTable.appendChild(row);
    });

    // Если нет данных, показываем сообщение
    if (reportNumber === 1) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fa fa-info-circle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                <p>Нет данных для отображения</p>
                <p style="font-size: 0.9rem; margin-top: 5px;">Данные появятся после совершения действий с товарами</p>
            </td>
        `;
        reportsTable.appendChild(emptyRow);
    }
}

// Создание строки отчёта
function createReportRow(number, image, name, price, quantity, gender, type, action, actionClass, date) {
    const row = document.createElement('tr');
    
    // Обработка изображения - показываем любое изображение, которое передано
    let imageHtml = '';
    
    if (image && image !== '' && image !== 'undefined' && image !== null && image !== 'null') {
        // Показываем ЛЮБОЕ изображение, которое передано, кроме явно пустых
        if (image === 'data:image/png;base64,' || image.includes('fa-plus')) {
            // Только для совсем пустых base64 или иконок плюса показываем fallback
            imageHtml = `<img src="./images/add_image.png" alt="${name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`;
        } else {
            // Показываем ЛЮБОЕ другое изображение
            imageHtml = `<img src="${image}" alt="${name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='./images/add_image.png';">`;
        }
    } else {
        imageHtml = `<img src="./images/add_image.png" alt="${name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`;
    }
    
    // Обработка цены (убираем символ рубля и пробелы)
    let cleanPrice = price;
    if (typeof price === 'string') {
        cleanPrice = price.replace(/[₽\sР]/g, '');
    }
    
    // Обработка пола (проверяем на undefined и пустые значения)
    let cleanGender = gender;
    if (!gender || gender === undefined || gender === null || gender === 'undefined' || gender === '' || gender === 'Не указан') {
        cleanGender = 'Не указан';
    }
    
    // Форматируем дату
    let formattedDate = formatDateForDisplay(date);
    
    row.innerHTML = `
        <td>${number}</td>
        <td>${imageHtml}</td>
        <td>${name}</td>
        <td>${cleanPrice}</td>
        <td>${quantity}</td>
        <td>${cleanGender}</td>
        <td>${type}</td>
        <td><span class="action-status ${actionClass}">${action}</span></td>
        <td>${formattedDate}</td>
    `;
    return row;
}

// Функция для логирования действий
function logAction(action, productData) {
    
    const actionData = {
        ...productData,
        date: new Date().toISOString(),
        timestamp: new Date().getTime()
    };
    

    switch (action) {
        case 'add':
            const addHistory = JSON.parse(localStorage.getItem('addHistory') || '[]');
            addHistory.push(actionData);
            localStorage.setItem('addHistory', JSON.stringify(addHistory));
            break;
        case 'sale':
            const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
            salesHistory.push(actionData);
            localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
            break;
        case 'warehouse':
            const warehouseHistory = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
            warehouseHistory.push(actionData);
            localStorage.setItem('warehouseHistory', JSON.stringify(warehouseHistory));
            break;
        case 'return':
            const returnHistory = JSON.parse(localStorage.getItem('returnHistory') || '[]');
            returnHistory.push(actionData);
            localStorage.setItem('returnHistory', JSON.stringify(returnHistory));
            break;
        case 'delete':
            const deleteHistory = JSON.parse(localStorage.getItem('deleteHistory') || '[]');
            deleteHistory.push(actionData);
            localStorage.setItem('deleteHistory', JSON.stringify(deleteHistory));
            break;
    }
}

// Загружаем сохраненную тему при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные отчётов
    loadReportsData();

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Загружаем статистику
    loadStatistics();
});

// Функция для обновления иконки темы
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme_toggle i');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'fa fa-moon';
        } else {
            themeIcon.className = 'fa fa-sun';
        }
    }
}

// Функция загрузки статистики
function loadStatistics() {
    // Получаем данные из localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const warehouseItemsData = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    
    // Статистика продаж
    const totalSalesCount = salesHistory.length;
    const totalRevenueAmount = salesHistory.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const averageCheck = totalSalesCount > 0 ? Math.round(totalRevenueAmount / totalSalesCount) : 0;
    
    if (totalSales) totalSales.textContent = totalSalesCount;
    if (totalRevenue) totalRevenue.textContent = `${formatPrice(totalRevenueAmount)}`;
    if (avgCheck) avgCheck.textContent = `${formatPrice(averageCheck)}`;
    
    // Товарные остатки
    const totalProductsCount = products.length;
    const warehouseItemsCount = warehouseItemsData.length;
    const lowStockCount = products.filter(product => product.quantity <= 5).length;
    
    if (totalProducts) totalProducts.textContent = totalProductsCount;
    if (warehouseItems) warehouseItems.textContent = warehouseItemsCount;
    if (lowStock) lowStock.textContent = lowStockCount;
    
    // Популярные товары
    if (salesHistory.length > 0) {
        // Находим самый продаваемый товар
        const productSales = {};
        salesHistory.forEach(sale => {
            if (productSales[sale.productName]) {
                productSales[sale.productName] += sale.quantity;
            } else {
                productSales[sale.productName] = sale.quantity;
            }
        });
        
        const topSellingProduct = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (topSeller) topSeller.textContent = topSellingProduct ? topSellingProduct[0] : '-';
        
        // Находим топ категорию
        const categorySales = {};
        salesHistory.forEach(sale => {
            if (categorySales[sale.productType]) {
                categorySales[sale.productType] += sale.quantity;
            } else {
                categorySales[sale.productType] = sale.quantity;
            }
        });
        
        const topCategoryName = Object.entries(categorySales)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (topCategory) topCategory.textContent = topCategoryName ? topCategoryName[0] : '-';
        
        // Определяем уровень активности
        const recentSales = salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return saleDate > weekAgo;
        });
        
        if (activityLevel) {
            if (recentSales.length >= 10) {
                activityLevel.textContent = 'Высокая';
                activityLevel.style.color = '#10b981';
            } else if (recentSales.length >= 5) {
                activityLevel.textContent = 'Средняя';
                activityLevel.style.color = '#f59e0b';
            } else {
                activityLevel.textContent = 'Низкая';
                activityLevel.style.color = '#ef4444';
            }
        }
    }
    
    // Финансовая аналитика
    const estimatedProfit = Math.round(totalRevenueAmount * 0.3); // Примерная прибыль 30%
    const profitMargin = totalRevenueAmount > 0 ? Math.round((estimatedProfit / totalRevenueAmount) * 100) : 0;
    
    if (profit) profit.textContent = `${formatPrice(estimatedProfit)}`;
    if (profitability) profitability.textContent = `${profitMargin}%`;
    
    // Определяем тренд
    const recentRevenue = salesHistory
        .filter(sale => {
            const saleDate = new Date(sale.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return saleDate > weekAgo;
        })
        .reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    const previousRevenue = salesHistory
        .filter(sale => {
            const saleDate = new Date(sale.date);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return saleDate > twoWeeksAgo && saleDate <= weekAgo;
        })
        .reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    if (trend) {
        if (recentRevenue > previousRevenue * 1.1) {
            trend.textContent = 'Растущий';
            trend.style.color = '#10b981';
        } else if (recentRevenue < previousRevenue * 0.9) {
            trend.textContent = 'Падающий';
            trend.style.color = '#ef4444';
        } else {
            trend.textContent = 'Стабильный';
            trend.style.color = '#f59e0b';
        }
    }
}

// Функции генерации отчётов
function generateSalesReport() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    
    if (salesHistory.length === 0) {
        alert('Нет данных о продажах для генерации отчёта');
        return;
    }
    
    // Создаем простой отчёт
    let report = 'ОТЧЁТ ПО ПРОДАЖАМ\n';
    report += '==================\n\n';
    report += `Дата генерации: ${new Date().toLocaleDateString()}\n`;
    report += `Всего продаж: ${salesHistory.length}\n`;
    report += `Общая выручка: ${formatPrice(salesHistory.reduce((sum, sale) => sum + sale.totalPrice, 0))}\n\n`;
    
    report += 'Детализация продаж:\n';
    salesHistory.forEach((sale, index) => {
        report += `${index + 1}. ${sale.productName} - ${sale.quantity} шт. - ${formatPrice(sale.totalPrice)} (${sale.date})\n`;
    });
    
    // Создаем файл для скачивания
    downloadReport(report, 'sales_report.txt');
    showSuccessNotification();
}

function generateInventoryReport() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
    
    if (products.length === 0 && warehouseItems.length === 0) {
        alert('Нет данных о товарах для генерации отчёта');
        return;
    }
    
    let report = 'ОТЧЁТ ПО ТОВАРНЫМ ОСТАТКАМ\n';
    report += '============================\n\n';
    report += `Дата генерации: ${new Date().toLocaleDateString()}\n`;
    report += `Всего товаров: ${products.length}\n`;
    report += `На складе: ${warehouseItems.length}\n\n`;
    
    report += 'Товары в продаже:\n';
    products.forEach((product, index) => {
        report += `${index + 1}. ${product.name} - ${product.quantity} шт. - ${formatPrice(product.price)} (${product.type})\n`;
    });
    
    if (warehouseItems.length > 0) {
        report += '\nТовары на складе:\n';
        warehouseItems.forEach((item, index) => {
            report += `${index + 1}. ${item.name} - ${item.quantity} шт. - ${formatPrice(item.price)} (${item.reason})\n`;
        });
    }
    
    downloadReport(report, 'inventory_report.txt');
    showSuccessNotification();
}

function generatePopularReport() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    
    if (salesHistory.length === 0) {
        alert('Нет данных о продажах для генерации отчёта');
        return;
    }
    
    let report = 'ОТЧЁТ ПО ПОПУЛЯРНЫМ ТОВАРАМ\n';
    report += '============================\n\n';
    report += `Дата генерации: ${new Date().toLocaleDateString()}\n\n`;
    
    // Анализ по товарам
    const productSales = {};
    salesHistory.forEach(sale => {
        if (productSales[sale.productName]) {
            productSales[sale.productName] += sale.quantity;
        } else {
            productSales[sale.productName] = sale.quantity;
        }
    });
    
    report += 'Топ продаж по товарам:\n';
    Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([product, quantity], index) => {
            report += `${index + 1}. ${product} - ${quantity} шт.\n`;
        });
    
    // Анализ по категориям
    const categorySales = {};
    salesHistory.forEach(sale => {
        if (categorySales[sale.productType]) {
            categorySales[sale.productType] += sale.quantity;
        } else {
            categorySales[sale.productType] = sale.quantity;
        }
    });
    
    report += '\nТоп продаж по категориям:\n';
    Object.entries(categorySales)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, quantity], index) => {
            report += `${index + 1}. ${category} - ${quantity} шт.\n`;
        });
    
    downloadReport(report, 'popular_products_report.txt');
    showSuccessNotification();
}

function generateFinancialReport() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    
    if (salesHistory.length === 0) {
        alert('Нет данных о продажах для генерации отчёта');
        return;
    }
    
    let report = 'ФИНАНСОВЫЙ ОТЧЁТ\n';
    report += '==================\n\n';
    report += `Дата генерации: ${new Date().toLocaleDateString()}\n\n`;
    
    const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const estimatedProfit = Math.round(totalRevenue * 0.3);
    const profitMargin = Math.round((estimatedProfit / totalRevenue) * 100);
    
    report += `Общая выручка: ${formatPrice(totalRevenue)}\n`;
    report += `Расчётная прибыль: ${formatPrice(estimatedProfit)}\n`;
    report += `Рентабельность: ${profitMargin}%\n\n`;
    
    // Анализ по периодам
    const monthlyRevenue = {};
    salesHistory.forEach(sale => {
        const month = new Date(sale.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        if (monthlyRevenue[month]) {
            monthlyRevenue[month] += sale.totalPrice;
        } else {
            monthlyRevenue[month] = sale.totalPrice;
        }
    });
    
    report += 'Выручка по месяцам:\n';
    Object.entries(monthlyRevenue)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .forEach(([month, revenue]) => {
            report += `${month}: ${formatPrice(revenue)}\n`;
        });
    
    downloadReport(report, 'financial_report.txt');
    showSuccessNotification();
}

// Функция для скачивания отчёта
function downloadReport(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Уведомление об успешном действии
// Переменная successNotification уже объявлена в main_page.js

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем данные отчётов
    loadReportsData();

    // Остальной код...
    const themeToggle = document.getElementById('theme_toggle');
    backToMainBtn = document.getElementById('back_to_main');
    // Переменная successNotification уже объявлена выше

    // Переключение темы
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fa fa-moon' : 'fa fa-sun';
            }
        });
    }

    // Загрузка сохранённой темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fa fa-moon' : 'fa fa-sun';
        }
    }

    // Кнопка возврата в главное меню
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            window.location.href = './main_page.html';
        });
    }

    // Функция showSuccessNotification уже объявлена в main_page.js

    // Поиск по отчётам
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search_find');

    function performSearch() {
        const reportsTable = document.querySelector('.reports_table');
        const reportsTableBody = reportsTable ? reportsTable.querySelector('tbody') : null;
        if (!reportsTableBody || !reportsTable) return;
        const searchTerm = searchInput.value.trim().toLowerCase();
        const searchWords = searchTerm.split(/\s+/).filter(Boolean);
        const rows = reportsTableBody.querySelectorAll('tr');
        if (!rows.length) return;
        let anyVisible = false;

        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const cellText = cells.map(cell => cell.textContent.toLowerCase()).join(' ');
            const match = searchWords.every(word => cellText.includes(word));
            if (match) {
                row.style.display = '';
                anyVisible = true;
            } else {
                row.style.display = 'none';
            }
        });

        // Сообщение, если ничего не найдено
        let emptyRow = document.getElementById('search_empty_row');
        if (!anyVisible && rows.length) {
            if (!emptyRow) {
                emptyRow = document.createElement('tr');
                emptyRow.id = 'search_empty_row';
                emptyRow.innerHTML = `<td colspan="9" style="text-align:center; color:#888; padding:40px; font-size:1.1rem;">Ничего не найдено</td>`;
                reportsTableBody.appendChild(emptyRow);
            } else {
                emptyRow.style.display = '';
            }
        } else if (emptyRow) {
            emptyRow.style.display = 'none';
        }
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Кнопка экспорта отчёта
    const exportPdfBtn = document.getElementById('export_pdf_btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            openReportModal();
        });
    }

    // Кнопка обновления страницы
    const refreshBtn = document.getElementById('refresh_page_btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            location.reload();
        });
    }
});

// Функция экспорта отчёта в HTML
function exportToPDF(startDate = null, endDate = null) {
    try {
        // Получаем данные из localStorage
        const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
        const warehouseHistory = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
        const deleteHistory = JSON.parse(localStorage.getItem('deleteHistory') || '[]');
        const addHistory = JSON.parse(localStorage.getItem('addHistory') || '[]');
        const returnHistory = JSON.parse(localStorage.getItem('returnHistory') || '[]');

        // Объединяем все записи
        const allActions = [];
        salesHistory.forEach(sale => {
            allActions.push({ ...sale, actionType: 'Продано', actionClass: 'sold' });
        });
        warehouseHistory.forEach(item => {
            allActions.push({ ...item, actionType: 'Складировано', actionClass: 'warehoused' });
        });
        deleteHistory.forEach(item => {
            allActions.push({ ...item, actionType: 'Удалено', actionClass: 'deleted' });
        });
        addHistory.forEach(item => {
            allActions.push({ ...item, actionType: 'Добавлено', actionClass: 'added' });
        });
        returnHistory.forEach(item => {
            allActions.push({ ...item, actionType: 'Возвращено', actionClass: 'returned' });
        });

        // Фильтруем по периоду, если указаны даты
        let filteredActions = allActions;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Включаем весь день окончания
            filteredActions = allActions.filter(action => {
                const actionDate = new Date(action.date);
                return actionDate >= start && actionDate <= end;
            });
        }

        // Сортируем по дате (новые сначала)
        filteredActions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredActions.length === 0) {
            alert('Нет данных за выбранный период!');
            return;
        }

        // --- АГРЕГАЦИЯ ДЕЙСТВИЙ ---
        // Для действий, которые можно агрегировать (например, 'Удалено', 'Складировано', 'Добавлено', 'Возвращено')
        // группируем по ключу: название, тип, пол, цена, изображение, действие, дата (до минут)
        function getAggKey(action) {
            // Округляем дату до минут (чтобы не было дублей по секундам)
            let dateKey = '';
            if (action.date) {
                const d = new Date(action.date);
                dateKey = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
            }
            return [
                action.productName || action.name || '',
                action.productType || action.type || '',
                action.productGender || action.gender || '',
                action.productPrice || action.price || action.pricePerUnit || 0,
                action.productImage || action.image || '',
                action.actionType || '',
                dateKey
            ].join('|');
        }
        const AGGREGATABLE = ['Удалено', 'Складировано', 'Добавлено', 'Возвращено'];
        const aggregated = [];
        const aggMap = new Map();
        filteredActions.forEach(action => {
            if (AGGREGATABLE.includes(action.actionType)) {
                const key = getAggKey(action);
                if (aggMap.has(key)) {
                    aggMap.get(key).quantity += action.quantity || 0;
                } else {
                    aggMap.set(key, { ...action });
                }
            } else {
                // Неагрегируемые действия (например, Продано)
                aggregated.push({ ...action });
            }
        });
        // Добавляем агрегированные действия
        aggMap.forEach(val => aggregated.push(val));
        // Сортируем по дате (новые сначала)
        aggregated.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Формируем HTML-отчёт
        const currentDate = new Date().toLocaleDateString('ru-RU');
        const currentTime = new Date().toLocaleTimeString('ru-RU');
        const periodInfo = startDate && endDate ? 
            `<p><strong>Период отчёта:</strong> ${new Date(startDate).toLocaleDateString('ru-RU')} - ${new Date(endDate).toLocaleDateString('ru-RU')}</p>` : 
            '';
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Отчёт по операциям магазина</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; vertical-align: middle; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .stats { margin-top: 20px; }
                    .stats h3 { color: #333; }
                    .stats p { margin: 5px 0; }
                    .img-cell img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
                </style>
            </head>
            <body>
                <h1>Отчёт по операциям магазина</h1>
                <p><strong>Дата создания:</strong> ${currentDate} ${currentTime}</p>
                ${periodInfo}
                <p><strong>Всего записей:</strong> ${aggregated.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Изображение</th>
                            <th>Наименование</th>
                            <th>Цена</th>
                            <th>Количество</th>
                            <th>Пол</th>
                            <th>Тип</th>
                            <th>Действие</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aggregated.map((action, index) => {
                            // Картинка
                            let imgSrc = action.productImage || action.image || './images/add_image.png';
                            // Если нет картинки или она пустая, ставим заглушку
                            if (!imgSrc || imgSrc === 'undefined' || imgSrc === 'null') {
                                imgSrc = './images/add_image.png';
                            }
                            return `
                            <tr>
                                <td>${index + 1}</td>
                                <td class="img-cell"><img src="${imgSrc}" alt="${action.productName || action.name || ''}" onerror="this.src='./images/add_image.png';"></td>
                                <td>${action.productName || action.name || 'Не указано'}</td>
                                <td>${formatPrice(action.productPrice || action.price || action.pricePerUnit || 0)}</td>
                                <td>${action.quantity || 0}</td>
                                <td>${action.productGender || action.gender || 'Не указан'}</td>
                                <td>${action.productType || action.type || 'Не указан'}</td>
                                <td>${action.actionType}</td>
                                <td>${formatDateForDisplay(action.date) || 'Не указана'}</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="stats">
                    <h3>Статистика:</h3>
                    <p><strong>Продажи:</strong> ${aggregated.filter(a => a.actionType === 'Продано').length}</p>
                    <p><strong>Выручка:</strong> ${formatPrice(aggregated.filter(a => a.actionType === 'Продано').reduce((sum, sale) => sum + (sale.productPrice || sale.price || sale.pricePerUnit || 0) * (sale.quantity || 1), 0))}</p>
                    <p><strong>Добавлено товаров:</strong> ${aggregated.filter(a => a.actionType === 'Добавлено').length}</p>
                    <p><strong>Удалено товаров:</strong> ${aggregated.filter(a => a.actionType === 'Удалено').length}</p>
                    <p><strong>Складировано:</strong> ${aggregated.filter(a => a.actionType === 'Складировано').length}</p>
                    <p><strong>Возвращено:</strong> ${aggregated.filter(a => a.actionType === 'Возвращено').length}</p>
                </div>
            </body>
            </html>
        `;

        // Скачиваем HTML-файл
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let filename = `отчет_магазина_${currentDate.replace(/\./g, '-')}`;
        if (startDate && endDate) {
            filename += `_${startDate.replace(/-/g, '')}-${endDate.replace(/-/g, '')}`;
        }
        filename += '.html';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Показываем уведомление об успехе
        if (typeof showSuccessNotification === 'function') {
            showSuccessNotification('HTML отчёт успешно создан!');
        } else {
            alert('HTML отчёт успешно создан!');
        }
        return;
    } catch (error) {
        console.error('Ошибка при создании HTML отчёта:', error);
        alert('Ошибка при создании HTML отчёта: ' + error.message);
    }
}

// Функции для работы с модальным окном
function openReportModal() {
    const modal = document.getElementById('report_period_modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Устанавливаем текущую дату как конечную
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('end_date').value = today;
        
        // Устанавливаем дату неделю назад как начальную
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        document.getElementById('start_date').value = weekAgo.toISOString().split('T')[0];
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeReportModal();
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeReportModal();
            }
        });
    }
}

function closeReportModal() {
    const modal = document.getElementById('report_period_modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setPeriod(period) {
    const startDate = document.getElementById('start_date');
    const endDate = document.getElementById('end_date');
    const today = new Date();
    
    switch(period) {
        case 'today':
            startDate.value = today.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
            break;
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate.value = yesterday.toISOString().split('T')[0];
            endDate.value = yesterday.toISOString().split('T')[0];
            break;
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            startDate.value = weekAgo.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
            break;
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            startDate.value = monthAgo.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
            break;
        case 'quarter':
            const quarterAgo = new Date(today);
            quarterAgo.setMonth(quarterAgo.getMonth() - 3);
            startDate.value = quarterAgo.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
            break;
        case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            startDate.value = yearAgo.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
            break;
    }
}

function generatePeriodReport() {
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    
    if (!startDate || !endDate) {
        alert('Пожалуйста, выберите даты начала и окончания периода!');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Дата начала не может быть позже даты окончания!');
        return;
    }
    
    // Закрываем модальное окно
    closeReportModal();
    
    // Генерируем отчёт за выбранный период
    exportToPDF(startDate, endDate);
}

// Экспорт функций для использования в других файлах
window.logAction = logAction;
window.exportToPDF = exportToPDF;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;
window.setPeriod = setPeriod;
window.generatePeriodReport = generatePeriodReport;

//
