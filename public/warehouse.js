// Переменные для элементов
const themeToggle = document.getElementById('theme_toggle');
const themeIcon = document.getElementById('theme_toggle').querySelector('i');
const backToMainBtn = document.getElementById('back_to_main');
const warehouseTableBody = document.querySelector('.warehouse_table tbody');

// Переменные для модалки детального просмотра
const warehouseDetailModal = document.getElementById('warehouse_detail_modal');
const closeWarehouseDetailModal = document.getElementById('close_warehouse_detail_modal');
const warehouseDetailImage = document.getElementById('warehouse_detail_image');
const warehouseDetailName = document.getElementById('warehouse_detail_name');
const warehouseDetailPrice = document.getElementById('warehouse_detail_price');
const warehouseDetailQuantity = document.getElementById('warehouse_detail_quantity');
const warehouseDetailGender = document.getElementById('warehouse_detail_gender');
const warehouseDetailType = document.getElementById('warehouse_detail_type');
const warehouseDetailDescription = document.getElementById('warehouse_detail_description');

// Кнопки действий
const returnToSaleBtn = document.getElementById('return_to_sale_btn');
const deleteWarehouseItemBtn = document.getElementById('delete_warehouse_item_btn');

// Переменные для модалки возврата в продажу
const returnToSaleModal = document.getElementById('return_to_sale_modal');
const closeReturnToSaleModal = document.getElementById('close_return_to_sale_modal');
const returnQuantityInput = document.getElementById('return_quantity');
const confirmReturnBtn = document.getElementById('confirm_return_btn');
const cancelReturnBtn = document.getElementById('cancel_return_btn');

// Переменные для модалки подтверждения удаления со склада
const deleteWarehouseConfirmModal = document.getElementById('delete_warehouse_confirm_modal');
const closeDeleteWarehouseConfirmModal = document.getElementById('close_delete_warehouse_confirm_modal');
const confirmDeleteWarehouseBtn = document.getElementById('confirm_delete_warehouse_btn');
const cancelDeleteWarehouseBtn = document.getElementById('cancel_delete_warehouse_btn');
const deleteWarehouseQuantity = document.getElementById('delete_warehouse_quantity');

let currentWarehouseRow = null;
let currentWarehouseItem = null; // Добавляем переменную для хранения данных текущего товара

// Функция для форматирования цены с пробелами
function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU').replace(/\s/g, ' ');
}

// Функция для получения текста причины резервирования
function getReasonText(reason) {
    const reasonMap = {
        'repair': 'Ремонт',
        'defect': 'Брак',
        'storage': 'Перемещение на склад',
        'inventory': 'Инвентаризация',
        'other': 'Другое'
    };
    return reasonMap[reason] || reason;
}

function deduplicateWarehouseItems(items) {
    const map = new Map();
    for (const item of items) {
        const key = item.originalRowId || item.id;
        if (map.has(key)) {
            // Суммируем количество, оставляем свежую дату
            const existing = map.get(key);
            existing.quantity += item.quantity;
            if (new Date(item.date) > new Date(existing.date)) {
                existing.date = item.date;
            }
        } else {
            map.set(key, { ...item });
        }
    }
    return Array.from(map.values());
}
window.deduplicateWarehouseItems = deduplicateWarehouseItems;

// Загружаем сохраненную тему при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Загружаем товары на склад
    loadWarehouseItems();
    
    // Добавляем обработчик клика на таблицу склада
    warehouseTableBody.addEventListener('click', handleWarehouseTableRowClick);

    if (!confirmDeleteWarehouseBtn) {
        console.error('❌ Кнопка confirmDeleteWarehouseBtn не найдена!');
    }

    // Поиск по складу
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search_find');
    const warehouseTable = document.querySelector('.warehouse_table');
    // warehouseTableBody уже объявлен выше

    function performWarehouseSearch() {
        if (!warehouseTableBody || !warehouseTable) return;
        const searchTerm = searchInput.value.trim().toLowerCase();
        const searchWords = searchTerm.split(/\s+/).filter(Boolean);
        const rows = warehouseTableBody.querySelectorAll('tr');
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
                warehouseTableBody.appendChild(emptyRow);
            } else {
                emptyRow.style.display = '';
            }
        } else if (emptyRow) {
            emptyRow.style.display = 'none';
        }
    }
    if (searchBtn && searchInput && warehouseTableBody) {
        searchBtn.addEventListener('click', performWarehouseSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performWarehouseSearch();
            }
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

// Функция для обновления иконки темы
function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fa fa-moon';
    } else {
        themeIcon.className = 'fa fa-sun';
    }
}

// Обработчик переключения темы
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Кнопка возврата в главное меню
backToMainBtn.addEventListener('click', () => {
    window.location.href = './main_page.html';
});

// Функция загрузки товаров на склад
function loadWarehouseItems() {
    let warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
    warehouseItems = deduplicateWarehouseItems(warehouseItems);
    localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
    warehouseTableBody.innerHTML = '';
    
    warehouseItems.forEach((item, index) => {
        
        let imgHtml = '';
        if (item.image) {
            imgHtml = `<img src='${item.image}' class='warehouse_image' alt='Изображение товара'>`;
        }
        
        const row = document.createElement('tr');
        row.setAttribute('data-id', item.id);
        // Добавляем originalRowId как data-атрибут к строке таблицы склада
        if (item.originalRowId) {
            row.setAttribute('data-original-id', item.originalRowId);
        }
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${imgHtml}</td>
            <td class='warehouse_name'>${item.name}</td>
            <td class='warehouse_price'>${formatPrice(item.price)}</td>
            <td class='warehouse_quantity'>${item.quantity}</td>
            <td class='warehouse_gender'>${item.gender}</td>
            <td class='warehouse_type'>${item.type}</td>
            <td class='warehouse_reason'>${getReasonText(item.reason)}</td>
            <td class='warehouse_date'>${new Date(item.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' |')}</td>
        `;
        row.setAttribute('data-description', item.description);
        warehouseTableBody.appendChild(row);
        
    });
    
}

// Обработчик клика по строке таблицы склада
function handleWarehouseTableRowClick(event) {
    const row = event.target.closest('tr');
    if (row && row.parentElement.tagName === 'TBODY') {
        openWarehouseDetailModal(row);
    }
}

// Функция для открытия модалки детального просмотра товара на складе
function openWarehouseDetailModal(row) {
    currentWarehouseRow = row;
    
    // Получаем данные из строки таблицы
    const cells = row.querySelectorAll('td');
    const productImage = cells[1].querySelector('img');
    const productName = cells[2].textContent;
    const productPrice = cells[3].textContent;
    const productQuantity = cells[4].textContent;
    const productGender = cells[5].textContent;
    const productType = cells[6].textContent;
    const productDescription = row.getAttribute('data-description') || '';
    
    // Сохраняем данные товара для использования в других функциях
    currentWarehouseItem = {
        id: row.getAttribute('data-id'),
        image: productImage ? productImage.src : '',
        name: productName,
        price: productPrice,
        quantity: parseInt(productQuantity),
        gender: productGender,
        type: productType,
        description: productDescription,
        originalRowId: row.getAttribute('data-original-id') || null // Читаем originalRowId из data-атрибута
    };
    
    // Заполняем модалку данными
    if (productImage) {
        warehouseDetailImage.src = productImage.src;
    } else {
        warehouseDetailImage.src = '';
    }
    
    warehouseDetailName.value = productName;
    warehouseDetailPrice.value = productPrice;
    warehouseDetailQuantity.value = productQuantity;
    warehouseDetailGender.value = productGender;
    warehouseDetailType.value = productType;
    warehouseDetailDescription.value = productDescription;
    
    // Показываем модалку
    warehouseDetailModal.classList.add('show');
}

// Функция для закрытия модалки детального просмотра
function closeWarehouseDetailModalFunc() {
    warehouseDetailModal.classList.remove('show');
    currentWarehouseRow = null;
    currentWarehouseItem = null; // Сбрасываем данные товара
}

// Обработчик закрытия модалки
closeWarehouseDetailModal.addEventListener('click', closeWarehouseDetailModalFunc);

// Закрытие модалки при клике вне её
warehouseDetailModal.addEventListener('click', (event) => {
    if (event.target === warehouseDetailModal) {
        closeWarehouseDetailModalFunc();
    }
});

// Обработчики кнопок действий в модалке детального просмотра
returnToSaleBtn.addEventListener('click', openReturnToSaleModal);
deleteWarehouseItemBtn.addEventListener('click', openDeleteWarehouseConfirmModal);

// Обработчики событий для модалки возврата в продажу
confirmReturnBtn.addEventListener('click', confirmReturn);
cancelReturnBtn.addEventListener('click', closeReturnToSaleModalFunc);
closeReturnToSaleModal.addEventListener('click', closeReturnToSaleModalFunc);

// Закрытие модалки возврата в продажу при клике вне её
returnToSaleModal.addEventListener('click', (event) => {
    if (event.target === returnToSaleModal) {
        closeReturnToSaleModalFunc();
    }
});

// Обработчики событий для модалки подтверждения удаления со склада
confirmDeleteWarehouseBtn.addEventListener('click', confirmDeleteWarehouse);
cancelDeleteWarehouseBtn.addEventListener('click', closeDeleteWarehouseConfirmModalFunc);
closeDeleteWarehouseConfirmModal.addEventListener('click', closeDeleteWarehouseConfirmModalFunc);

// Закрытие модалки подтверждения удаления при клике вне её
deleteWarehouseConfirmModal.addEventListener('click', (event) => {
    if (event.target === deleteWarehouseConfirmModal) {
        closeDeleteWarehouseConfirmModalFunc();
    }
});

// Уведомление об успешном действии
const successNotification = document.getElementById('success_notification');

function showSuccessNotification() {
    successNotification.classList.add('show');
    
    setTimeout(() => {
        successNotification.classList.remove('show');
    }, 2000);
}

// Экспортируем функцию для использования в других модулях
window.showSuccessNotification = showSuccessNotification;

// Функция для открытия модалки возврата в продажу
function openReturnToSaleModal() {
    if (!currentWarehouseRow || !currentWarehouseItem) return;
    
    // Устанавливаем максимальное количество для input
    returnQuantityInput.max = currentWarehouseItem.quantity;
    returnQuantityInput.value = 1;
    
    // Показываем модалку
    returnToSaleModal.classList.add('show');
}

// Функция для закрытия модалки возврата в продажу
function closeReturnToSaleModalFunc() {
    returnToSaleModal.classList.remove('show');
    returnQuantityInput.value = 1;
}

// Функция для подтверждения возврата в продажу
function confirmReturn() {
    if (window.LicenseGuard && typeof window.LicenseGuard.isLocked === 'function' && window.LicenseGuard.isLocked()) {
        if (typeof window.LicenseGuard.showModal === 'function') {
            window.LicenseGuard.showModal();
        }
        return;
    }
    
    const quantity = parseInt(returnQuantityInput.value) || 0;
    
    if (quantity <= 0) {
        alert('Количество должно быть больше 0');
        return;
    }
    
    if (quantity > currentWarehouseItem.quantity) {
        alert(`Недостаточно товара на складе. Доступно: ${currentWarehouseItem.quantity}`);
        return;
    }
    
    // Обновляем количество в таблице склада
    const quantityCell = currentWarehouseRow.querySelector('.warehouse_quantity');
    const newQuantity = currentWarehouseItem.quantity - quantity;
    quantityCell.textContent = newQuantity;
    
    // Обновляем данные в localStorage для склада
            let warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
        const itemIndex = warehouseItems.findIndex(item => item.id == currentWarehouseItem.id);
    
    if (itemIndex !== -1) {
        if (newQuantity === 0) {
            // Если товар полностью возвращен, удаляем его со склада
            warehouseItems.splice(itemIndex, 1);
        } else {
            // Обновляем количество
            warehouseItems[itemIndex].quantity = newQuantity;
        }
        warehouseItems = deduplicateWarehouseItems(warehouseItems); // Удаляем дубликаты после изменения
        localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
    }
    
    // Возвращаем товар в главное меню (products)
    // ЗАЩИТА: Проверяем наличие резервной копии от main_page.js
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    const backup = localStorage.getItem('products_backup');
    
    // Если есть резервная копия и она новее, используем её
    if (backup && backup !== '[]') {
        const backupProducts = JSON.parse(backup);
        if (backupProducts.length > 0) {
            products = backupProducts;
            // Обновляем основные данные актуальными
            localStorage.setItem('products', backup);
        }
    }
    const originalProductId = currentWarehouseItem.originalRowId;
    
    let productFound = false;
    
    if (originalProductId) {
        // Сначала пытаемся найти по originalRowId
        const productIndex = products.findIndex(product => product.id == originalProductId);
        
        if (productIndex !== -1) {
            // Добавляем количество обратно к оригинальному товару
            const currentQuantity = Number(products[productIndex].quantity) || 0;
            const returnQuantity = Number(quantity) || 0;
            const newQuantity = currentQuantity + returnQuantity;
            
            products[productIndex].quantity = newQuantity;
            localStorage.setItem('products', JSON.stringify(products));
            
            productFound = true;
        }
    }
    
    // Если не нашли по originalRowId, ищем по характеристикам товара
    if (!productFound) {
        const productIndex = products.findIndex(product => 
            product.name === currentWarehouseItem.name &&
            product.price === currentWarehouseItem.price &&
            product.gender === currentWarehouseItem.gender &&
            product.type === currentWarehouseItem.type
        );
        
        if (productIndex !== -1) {
            // Добавляем количество обратно к найденному товару
            const currentQuantity = Number(products[productIndex].quantity) || 0;
            const returnQuantity = Number(quantity) || 0;
            const newQuantity = currentQuantity + returnQuantity;
            
            products[productIndex].quantity = newQuantity;
            localStorage.setItem('products', JSON.stringify(products));
            
            productFound = true;
        }
    }
    
    // Если товар не найден, создаем новый (это должно происходить редко)
    if (!productFound) {
        const newProduct = {
            id: Date.now(),
            name: currentWarehouseItem.name,
            price: currentWarehouseItem.price,
            quantity: quantity,
            gender: currentWarehouseItem.gender,
            type: currentWarehouseItem.type,
            description: currentWarehouseItem.description,
            image: currentWarehouseItem.image
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Обновляем количество в модалке детального просмотра
    warehouseDetailQuantity.value = newQuantity;
    
    // Если товар полностью возвращен, закрываем модалку детального просмотра
    if (newQuantity === 0) {
        closeWarehouseDetailModalFunc();
        // Удаляем строку из таблицы (проверяем, что currentWarehouseRow не null)
        if (currentWarehouseRow) {
            currentWarehouseRow.remove();
        }
    }
    
    // Логируем действие возврата в продажу
    if (window.logAction) {
        window.logAction('return', {
            productName: currentWarehouseItem.name,
            productImage: currentWarehouseItem.image || './images/add_image.png',
            productPrice: currentWarehouseItem.price,
            quantity: quantity,
            productGender: currentWarehouseItem.gender || 'Не указан',
            productType: currentWarehouseItem.type,
            date: new Date().toISOString()
        });
    } else {
        // Fallback если функция logAction недоступна
        const returnHistory = JSON.parse(localStorage.getItem('returnHistory') || '[]');
        const returnRecord = {
            productName: currentWarehouseItem.name,
            productImage: currentWarehouseItem.image || './images/add_image.png',
            productPrice: currentWarehouseItem.price,
            quantity: quantity,
            productGender: currentWarehouseItem.gender || 'Не указан',
            productType: currentWarehouseItem.type,
            date: new Date().toISOString(),
            type: 'return'
        };
        returnHistory.push(returnRecord);
        localStorage.setItem('returnHistory', JSON.stringify(returnHistory));
    }
    
    // Закрываем модалку возврата в продажу
    closeReturnToSaleModalFunc();
    
    // Показываем уведомление об успешном возврате
    showSuccessNotification();
}

// Функция для открытия модалки подтверждения удаления со склада
function openDeleteWarehouseConfirmModal() {
    if (!currentWarehouseRow) return;
    // Берём id из строки
    const rowId = currentWarehouseRow.getAttribute('data-id');
    const warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
    const item = warehouseItems.find(item => String(item.id) === String(rowId));
    if (item) {
        currentWarehouseItem = item;
    }
    // Обновляем отображение доступного количества
    const availableQuantityDisplay = document.getElementById('available_quantity_display');
    if (availableQuantityDisplay && currentWarehouseItem) {
        availableQuantityDisplay.textContent = currentWarehouseItem.quantity;
    }
    if (deleteWarehouseQuantity && currentWarehouseItem) {
        deleteWarehouseQuantity.max = currentWarehouseItem.quantity;
        deleteWarehouseQuantity.value = currentWarehouseItem.quantity > 0 ? 1 : 0;
    }
    deleteWarehouseConfirmModal.classList.add('show');
}

// Функция для закрытия модалки подтверждения удаления со склада
function closeDeleteWarehouseConfirmModalFunc() {
    deleteWarehouseConfirmModal.classList.remove('show');
}

// Функция для подтверждения удаления со склада
function confirmDeleteWarehouse() {
    if (window.LicenseGuard && typeof window.LicenseGuard.isLocked === 'function' && window.LicenseGuard.isLocked()) {
        if (typeof window.LicenseGuard.showModal === 'function') {
            window.LicenseGuard.showModal();
        }
        return;
    }
    if (!currentWarehouseRow || !currentWarehouseItem) return;
    const quantity = parseInt(deleteWarehouseQuantity.value);
    if (quantity > currentWarehouseItem.quantity) {
        alert(`Недостаточно товара для удаления. Доступно: ${currentWarehouseItem.quantity}`);
        return;
    }
    if (quantity <= 0) {
        alert('Количество должно быть больше 0');
        return;
    }
    const productData = {
        productName: currentWarehouseItem.name,
        productType: currentWarehouseItem.type,
        productGender: currentWarehouseItem.gender || 'Не указан',
        productPrice: Number(currentWarehouseItem.price),
        quantity: quantity,
        productImage: currentWarehouseItem.image || './images/add_image.png',
        date: new Date().toISOString()
    };
    const quantityCell = currentWarehouseRow.querySelector('.warehouse_quantity');
    const newQuantity = currentWarehouseItem.quantity - quantity;
    const warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
    const warehouseIndex = warehouseItems.findIndex(item => item.id === currentWarehouseItem.id);
    if (warehouseIndex !== -1) {
        if (newQuantity <= 0) {
            // Логируем только если удаляем всё количество
            if (window.logAction) {
                window.logAction('delete', productData);
            } else {
                const deleteHistory = JSON.parse(localStorage.getItem('deleteHistory') || '[]');
                deleteHistory.push(productData);
                localStorage.setItem('deleteHistory', JSON.stringify(deleteHistory));
            }
            warehouseItems.splice(warehouseIndex, 1);
            currentWarehouseRow.remove();
        } else {
            // Логируем только частичное удаление
            if (window.logAction) {
                window.logAction('delete', productData);
            } else {
                const deleteHistory = JSON.parse(localStorage.getItem('deleteHistory') || '[]');
                deleteHistory.push(productData);
                localStorage.setItem('deleteHistory', JSON.stringify(deleteHistory));
            }
            warehouseItems[warehouseIndex].quantity = newQuantity;
            quantityCell.textContent = newQuantity;
        }
        // Удаляем дубликаты по id (на всякий случай)
        const uniqueItems = [];
        const seenIds = new Set();
        for (const item of warehouseItems) {
            if (!seenIds.has(item.id)) {
                uniqueItems.push(item);
                seenIds.add(item.id);
            }
        }
        localStorage.setItem('warehouseItems', JSON.stringify(uniqueItems));
    }
    loadWarehouseItems();
    // Обновляем отображение доступного количества
    const availableQuantityDisplay = document.getElementById('available_quantity_display');
    if (availableQuantityDisplay && currentWarehouseItem) {
        availableQuantityDisplay.textContent = newQuantity > 0 ? newQuantity : 0;
    }
    closeDeleteWarehouseConfirmModalFunc();
}

//
