// Переменные для DOM элементов
let add_product, modal_window, close_modal_window, standard_file_input, image_selected_inner;
let cropperModal, cropperImage, cropperCancel, cropperSave;
let productFormFields, submitBtn, clearBtn, productForm, productsTableBody;
let productDetailModal, closeProductDetailModal, detailProductImage, detailProductName;
let detailProductPrice, detailProductQuantity, detailProductGender, detailProductType, detailProductDescription;
let sellProductBtn, deleteProductBtn, reserveProductBtn;
let sellProductModal, closeSellProductModal, sellQuantityInput, sellTotalPriceInput, confirmSellBtn, cancelSellBtn;
let deleteConfirmModal, closeDeleteConfirmModal, confirmDeleteBtn, cancelDeleteBtn;
let reserveProductModal, closeReserveProductModal, reserveQuantityInput, reserveReasonSelect, confirmReserveBtn, cancelReserveBtn;
let warehouseBtn, reportsBtn, clearStorageBtn;
let successNotification;

// Переменные для состояния
let currentProduct = null;
let cropper = null;
let products = [];

// Функция для форматирования цены с пробелами
function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU').replace(/\s/g, ' ');
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация DOM элементов
    add_product = document.getElementById('add_product');
    modal_window = document.getElementById('modal_window');
    close_modal_window = document.getElementById('close_modal_window');
    standard_file_input = document.getElementById('standard_file_input');
    image_selected_inner = document.getElementById('image_selected_inner');
    cropperModal = document.getElementById('cropper_modal');
    cropperImage = document.getElementById('cropper_image');
    cropperCancel = document.getElementById('cropper_cancel');
    cropperSave = document.getElementById('cropper_save');
    productForm = document.querySelector('#modal_window_add_product form');
    productsTableBody = document.querySelector('.products_table tbody');
    productDetailModal = document.getElementById('product_detail_modal');
    closeProductDetailModal = document.getElementById('close_product_detail_modal');
    detailProductImage = document.getElementById('detail_product_image');
    detailProductName = document.getElementById('detail_product_name');
    detailProductPrice = document.getElementById('detail_product_price');
    detailProductQuantity = document.getElementById('detail_product_quantity');
    detailProductGender = document.getElementById('detail_product_gender');
    detailProductType = document.getElementById('detail_product_type');
    detailProductDescription = document.getElementById('detail_product_description');
    sellProductBtn = document.getElementById('sell_product_btn');
    deleteProductBtn = document.getElementById('delete_product_btn');
    reserveProductBtn = document.getElementById('reserve_product_btn');
    sellProductModal = document.getElementById('sell_product_modal');
    closeSellProductModal = document.getElementById('close_sell_product_modal');
    sellQuantityInput = document.getElementById('sell_quantity');
    sellTotalPriceInput = document.getElementById('sell_total_price');
    confirmSellBtn = document.getElementById('confirm_sell_btn');
    cancelSellBtn = document.getElementById('cancel_sell_btn');
    deleteConfirmModal = document.getElementById('delete_confirm_modal');
    closeDeleteConfirmModal = document.getElementById('close_delete_confirm_modal');
    confirmDeleteBtn = document.getElementById('confirm_delete_btn');
    cancelDeleteBtn = document.getElementById('cancel_delete_btn');
    reserveProductModal = document.getElementById('reserve_product_modal');
    closeReserveProductModal = document.getElementById('close_reserve_product_modal');
    reserveQuantityInput = document.getElementById('reserve_quantity');
    reserveReasonSelect = document.getElementById('reserve_reason');
    confirmReserveBtn = document.getElementById('confirm_reserve_btn');
    cancelReserveBtn = document.getElementById('cancel_reserve_btn');
    warehouseBtn = document.getElementById('warehouse_btn');
    reportsBtn = document.getElementById('reports_btn');
    clearStorageBtn = document.getElementById('clear_storage_btn');
    successNotification = document.getElementById('success_notification');

    // Получение полей формы
    productFormFields = {
        name: document.getElementById('product_name'),
        price: document.getElementById('product_price'),
        quantity: document.getElementById('product_quantity'),
        gender: document.getElementById('product_gender'),
        type: document.getElementById('product_type'),
        description: document.getElementById('product_description')
    };

    submitBtn = document.getElementById('submit_product_form');
    clearBtn = document.getElementById('clear_product_form');

    // Загрузка продуктов из localStorage
    loadProducts();

    // Привязка событий
    if (add_product) {
        add_product.addEventListener('click', openAddProductModal);
    }
    
    if (close_modal_window) {
        close_modal_window.addEventListener('click', closeAddProductModal);
    }
    
    if (standard_file_input) {
        standard_file_input.addEventListener('change', handleImageSelect);
    }
    
    if (cropperCancel) {
        cropperCancel.addEventListener('click', closeCropperModal);
    }
    
    if (cropperSave) {
        cropperSave.addEventListener('click', saveCroppedImage);
    }
    
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearProductForm);
    }

    // События для полей формы
    Object.values(productFormFields).forEach(field => {
        if (field) {
            field.addEventListener('input', updateSubmitBtnState);
        }
    });

    // События для модалок детального просмотра
    if (closeProductDetailModal) {
        closeProductDetailModal.addEventListener('click', closeProductDetailModalFunc);
    }
    
    if (sellProductBtn) {
        sellProductBtn.addEventListener('click', openSellProductModal);
    }
    
    if (deleteProductBtn) {
        deleteProductBtn.addEventListener('click', openDeleteConfirmModal);
    }
    
    if (reserveProductBtn) {
        reserveProductBtn.addEventListener('click', openReserveProductModal);
    }

    // События для модалки продажи
    if (closeSellProductModal) {
        closeSellProductModal.addEventListener('click', closeSellProductModalFunc);
    }
    
    if (sellQuantityInput) {
        sellQuantityInput.addEventListener('input', updateTotalPrice);
    }
    
    if (confirmSellBtn) {
        confirmSellBtn.addEventListener('click', confirmSellProduct);
    }
    
    if (cancelSellBtn) {
        cancelSellBtn.addEventListener('click', closeSellProductModalFunc);
    }

    // События для модалки подтверждения удаления
    if (closeDeleteConfirmModal) {
        closeDeleteConfirmModal.addEventListener('click', closeDeleteConfirmModalFunc);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteProduct);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModalFunc);
    }

    // События для модалки резервирования
    if (closeReserveProductModal) {
        closeReserveProductModal.addEventListener('click', closeReserveProductModalFunc);
    }
    
    if (confirmReserveBtn) {
        confirmReserveBtn.addEventListener('click', confirmReserveProduct);
    }
    
    if (cancelReserveBtn) {
        cancelReserveBtn.addEventListener('click', closeReserveProductModalFunc);
    }

    // События для навигационных кнопок
    if (warehouseBtn) {
        warehouseBtn.addEventListener('click', () => {
            window.location.href = 'warehouse_menu.html';
        });
    }
    
    if (reportsBtn) {
        reportsBtn.addEventListener('click', () => {
            window.location.href = 'reports_menu.html';
        });
    }
    
    if (clearStorageBtn) {
        clearStorageBtn.addEventListener('click', clearAllData);
    }

    // Кнопка обновления страницы
    const refreshBtn = document.getElementById('refresh_page_btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            location.reload();
        });
    }

    // Закрытие модалок при клике вне их
    window.addEventListener('click', function(event) {
        if (event.target === modal_window) {
            closeAddProductModal();
        }
        if (event.target === productDetailModal) {
            closeProductDetailModalFunc();
        }
        if (event.target === sellProductModal) {
            closeSellProductModalFunc();
        }
        if (event.target === deleteConfirmModal) {
            closeDeleteConfirmModalFunc();
        }
        if (event.target === reserveProductModal) {
            closeReserveProductModalFunc();
        }
    });

    // Поиск по продукции
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search_find');
    // productsTableBody уже объявлена глобально выше, просто присваиваем:
    const productsTable = document.querySelector('.products_table');

    function performProductSearch() {
        if (!productsTableBody || !productsTable) return;
        const searchTerm = searchInput.value.trim().toLowerCase();
        const searchWords = searchTerm.split(/\s+/).filter(Boolean);
        const rows = productsTableBody.querySelectorAll('tr');
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
                emptyRow.innerHTML = `<td colspan="7" style="text-align:center; color:#888; padding:40px; font-size:1.1rem;">Ничего не найдено</td>`;
                productsTableBody.appendChild(emptyRow);
            } else {
                emptyRow.style.display = '';
            }
        } else if (emptyRow) {
            emptyRow.style.display = 'none';
        }
    }
    if (searchBtn && searchInput && productsTableBody) {
        searchBtn.addEventListener('click', performProductSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performProductSearch();
            }
        });
    }
});

// Функции для работы с модальным окном добавления продукта
function openAddProductModal() {
    if (modal_window) {
        modal_window.style.display = 'flex';
    }
}

function closeAddProductModal() {
    if (modal_window) {
        modal_window.style.display = 'none';
        clearProductForm();
    }
}

// Функции для работы с изображениями
function handleImageSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const fileName = typeof file.name === 'string' ? file.name : '';
    const extension = (fileName.split('.').pop() || '').toLowerCase();
    const mimeType = file.type || '';

    const isHeicOrHeif =
        extension === 'heic' ||
        extension === 'heif' ||
        mimeType === 'image/heic' ||
        mimeType === 'image/heif';

    // Если HEIC/HEIF — конвертируем в JPEG перед отображением в <img>/Cropper
    if (isHeicOrHeif && typeof window !== 'undefined' && window.heic2any) {
        try {
            window
                .heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
                .then(function(convertedBlob) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        openCropperModal(e.target.result);
                    };
                    reader.readAsDataURL(convertedBlob);
                })
                .catch(function(err) {
                    console.error('HEIC/HEIF conversion error:', err);
                    alert('Не удалось обработать HEIC/HEIF изображение. Пожалуйста, попробуйте другое изображение.');
                });
        } catch (error) {
            console.error('HEIC/HEIF conversion exception:', error);
            alert('Ошибка при обработке HEIC/HEIF. Попробуйте другое изображение.');
        }
        return;
    } else if (isHeicOrHeif) {
        alert('Формат HEIC/HEIF поддерживается после подключения конвертера. Пожалуйста, обновите страницу или выберите PNG/JPG.');
        return;
    }

    // Для PNG/JPG/JPEG и прочих поддерживаемых браузером изображений — как раньше
    if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(extension)) {
        const reader = new FileReader();
        reader.onload = function(e) {
            openCropperModal(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function openCropperModal(imageSrc) {
    if (cropperModal && cropperImage) {
        cropperImage.src = imageSrc;
        cropperModal.style.display = 'flex';
        
        if (cropper) {
            cropper.destroy();
        }
        
        cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            background: false, // Отключаем фон для сохранения прозрачности
            fillColor: 'transparent' // Устанавливаем прозрачный цвет заливки
        });
    }
}

function closeCropperModal() {
    if (cropperModal) {
        cropperModal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }
}

function saveCroppedImage() {
    if (cropper) {
        const canvas = cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            fillColor: 'transparent', // Прозрачный фон
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        const croppedImageUrl = canvas.toDataURL('image/png');
        
        if (image_selected_inner) {
            image_selected_inner.innerHTML = `
                <img src="${croppedImageUrl}" alt="Выбранное изображение" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
            `;
        }
        
        closeCropperModal();
    }
}

// Функции для работы с формой
function isFormValid() {
    if (!productFormFields.name || !productFormFields.price || !productFormFields.quantity || 
        !productFormFields.gender || !productFormFields.type || !productFormFields.description) {
        return false;
    }
    
    return productFormFields.name.value.trim() !== '' &&
           productFormFields.price.value > 0 &&
           productFormFields.quantity.value > 0 &&
           productFormFields.gender.value !== '' &&
           productFormFields.type.value !== '' &&
           productFormFields.description.value.trim() !== '';
}

function updateSubmitBtnState() {
    if (submitBtn) {
        submitBtn.disabled = !isFormValid();
    }
}

function clearProductForm() {
    Object.values(productFormFields).forEach(field => {
        if (field) {
            field.value = '';
        }
    });
    
    if (image_selected_inner) {
        image_selected_inner.innerHTML = '';
    }
    
    if (standard_file_input) {
        standard_file_input.value = '';
    }
    
    updateSubmitBtnState();
}

function handleProductSubmit(event) {
    event.preventDefault();
    if (window.LicenseGuard && typeof window.LicenseGuard.isLocked === 'function' && window.LicenseGuard.isLocked()) {
        if (typeof window.LicenseGuard.showModal === 'function') {
            window.LicenseGuard.showModal();
        }
        return;
    }
    
    if (!isFormValid()) {
        return;
    }
    
    const product = {
        id: Date.now(),
        name: productFormFields.name.value.trim(),
        price: parseFloat(productFormFields.price.value),
        quantity: parseInt(productFormFields.quantity.value),
        gender: productFormFields.gender.value,
        type: productFormFields.type.value,
        description: productFormFields.description.value.trim(),
        image: image_selected_inner.querySelector('img')?.src || '',
        dateAdded: new Date().toISOString()
    };
    
    products.push(product);
    saveProducts();
    
    // Логируем действие добавления продукта
    if (window.logAction) {
        window.logAction('add', {
            productName: product.name,
            productImage: product.image,
            productPrice: product.price,
            quantity: product.quantity,
            productGender: getGenderText(product.gender),
            productType: getTypeText(product.type),
            date: new Date().toISOString()
        });
    }
    
    displayProducts();
    closeAddProductModal();
    showSuccessNotification();
}

// Функции для работы с продуктами
function loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        displayProducts();
    }
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function displayProducts() {
    if (!productsTableBody) return;
    
    productsTableBody.innerHTML = '';
    
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <img src="${product.image || './images/add_image.png'}" alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td>${product.name}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.quantity}</td>
            <td>${getGenderText(product.gender)}</td>
            <td>${getTypeText(product.type)}</td>
        `;
        
        // Добавляем обработчик клика на всю строку
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => openProductDetail(product.id));
        
        productsTableBody.appendChild(row);
    });
}

function getGenderText(gender) {
    const genderMap = {
        'male': 'Мужской',
        'female': 'Женский'
    };
    return genderMap[gender] || gender;
}

function getTypeText(type) {
    const typeMap = {
        'hats': 'Головные уборы',
        'outerwear': 'Верхняя одежда',
        'underwear': 'Нижняя одежда',
        'lingerie': 'Нижнее бельё',
        'footwear': 'Ножная одежда',
        'shoes': 'Обувь',
        'perfume': 'Духи',
        'belts': 'Поясы',
        'jewelry': 'Украшения'
    };
    return typeMap[type] || type;
}

// Функции для детального просмотра продукта
function openProductDetail(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    if (detailProductImage) detailProductImage.src = currentProduct.image || './images/add_image.png';
    if (detailProductName) detailProductName.value = currentProduct.name;
            if (detailProductPrice) detailProductPrice.value = `${formatPrice(currentProduct.price)}`;
    if (detailProductQuantity) detailProductQuantity.value = currentProduct.quantity;
    if (detailProductGender) detailProductGender.value = getGenderText(currentProduct.gender);
    if (detailProductType) detailProductType.value = getTypeText(currentProduct.type);
    if (detailProductDescription) detailProductDescription.value = currentProduct.description;
    
    if (productDetailModal) {
        productDetailModal.style.display = 'flex';
    }
}

function closeProductDetailModalFunc() {
    if (productDetailModal) {
        productDetailModal.style.display = 'none';
    }
    currentProduct = null;
}

// Функции для продажи продукта
function openSellProductModal() {
    if (!currentProduct || !sellProductModal) return;
    
    if (sellQuantityInput) {
        sellQuantityInput.max = currentProduct.quantity;
        sellQuantityInput.value = 1;
    }
    
    updateTotalPrice();
    sellProductModal.style.display = 'flex';
}

function closeSellProductModalFunc() {
    if (sellProductModal) {
        sellProductModal.style.display = 'none';
    }
}

function updateTotalPrice() {
    if (!currentProduct || !sellQuantityInput || !sellTotalPriceInput) return;
    
    const quantity = parseInt(sellQuantityInput.value) || 0;
    const totalPrice = quantity * currentProduct.price;
                sellTotalPriceInput.value = `${formatPrice(totalPrice)}`;
}

function confirmSellProduct() {
    if (!currentProduct || !sellQuantityInput) return;
    
    const quantity = parseInt(sellQuantityInput.value);
    if (quantity > currentProduct.quantity) {
        alert('Недостаточно товара на складе!');
        return;
    }
    
    currentProduct.quantity -= quantity;
    
    if (currentProduct.quantity === 0) {
        products = products.filter(p => p.id !== currentProduct.id);
    }
    
    // Логируем действие продажи
    if (window.logAction) {
        window.logAction('sale', {
            productName: currentProduct.name,
            productImage: currentProduct.image,
            productPrice: currentProduct.price,
            quantity: quantity,
            totalPrice: quantity * currentProduct.price,
            productGender: getGenderText(currentProduct.gender),
            productType: getTypeText(currentProduct.type),
            date: new Date().toISOString()
        });
    }
    
    saveProducts();
    displayProducts();
    closeSellProductModalFunc();
    closeProductDetailModalFunc();
    showSuccessNotification();
}

// Функции для удаления продукта
function openDeleteConfirmModal() {
    if (!currentProduct || !deleteConfirmModal) return;
    deleteConfirmModal.style.display = 'flex';
}

function closeDeleteConfirmModalFunc() {
    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = 'none';
    }
}

function confirmDeleteProduct() {
    if (window.LicenseGuard && typeof window.LicenseGuard.isLocked === 'function' && window.LicenseGuard.isLocked()) {
        if (typeof window.LicenseGuard.showModal === 'function') {
            window.LicenseGuard.showModal();
        }
        return;
    }
    if (!currentProduct) return;
    
    // Логируем действие удаления
    if (window.logAction) {
        window.logAction('delete', {
            productName: currentProduct.name,
            productImage: currentProduct.image,
            productPrice: currentProduct.price,
            quantity: currentProduct.quantity,
            productGender: getGenderText(currentProduct.gender),
            productType: getTypeText(currentProduct.type),
            date: new Date().toISOString()
        });
    }
    
    products = products.filter(p => p.id !== currentProduct.id);
    saveProducts();
    displayProducts();
    closeDeleteConfirmModalFunc();
    closeProductDetailModalFunc();
    showSuccessNotification();
}

// Функции для резервирования продукта
function openReserveProductModal() {
    if (!currentProduct || !reserveProductModal) return;
    
    if (reserveQuantityInput) {
        reserveQuantityInput.max = currentProduct.quantity;
        reserveQuantityInput.value = 1;
    }
    
    reserveProductModal.style.display = 'flex';
}

function closeReserveProductModalFunc() {
    if (reserveProductModal) {
        reserveProductModal.style.display = 'none';
    }
}

function confirmReserveProduct() {
    if (window.LicenseGuard && typeof window.LicenseGuard.isLocked === 'function' && window.LicenseGuard.isLocked()) {
        if (typeof window.LicenseGuard.showModal === 'function') {
            window.LicenseGuard.showModal();
        }
        return;
    }
    if (!currentProduct || !reserveQuantityInput || !reserveReasonSelect) return;
    
    const quantity = parseInt(reserveQuantityInput.value);
    const reason = reserveReasonSelect.value;
    
    if (quantity > currentProduct.quantity) {
        alert('Недостаточно товара на складе!');
        return;
    }
    
    if (!reason) {
        alert('Выберите причину резервирования!');
        return;
    }
    
    currentProduct.quantity -= quantity;
    
    if (currentProduct.quantity === 0) {
        products = products.filter(p => p.id !== currentProduct.id);
    }
    
    // Логируем действие резервирования
    if (window.logAction) {
        window.logAction('warehouse', {
            productName: currentProduct.name,
            productImage: currentProduct.image,
            productPrice: currentProduct.price,
            quantity: quantity,
            productGender: getGenderText(currentProduct.gender),
            productType: getTypeText(currentProduct.type),
            reason: reason,
            date: new Date().toISOString()
        });
    }
    
    // Сохраняем резервированный товар в склад
    const warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
    // Ищем товар по originalRowId (id исходного товара)
    const existing = warehouseItems.find(item => String(item.originalRowId) === String(currentProduct.id));
    if (existing) {
        existing.quantity += quantity;
        existing.date = new Date().toISOString(); // обновляем дату поступления
    } else {
        const warehouseItem = {
            id: Date.now(),
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: quantity,
            gender: getGenderText(currentProduct.gender),
            type: getTypeText(currentProduct.type),
            description: currentProduct.description || '',
            image: currentProduct.image,
            reason: reason,
            date: new Date().toISOString(),
            originalRowId: currentProduct.id
        };
        warehouseItems.push(warehouseItem);
    }
    localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
    
    // После добавления или изменения товара на складе:
    if (window.deduplicateWarehouseItems) {
        const deduped = window.deduplicateWarehouseItems(warehouseItems);
        localStorage.setItem('warehouseItems', JSON.stringify(deduped));
    } else {
        localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
    }
    
    saveProducts();
    displayProducts();
    closeReserveProductModalFunc();
    closeProductDetailModalFunc();
    showSuccessNotification();
}

// Функция для очистки всех данных
function clearAllData() {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
        if (window.LicenseGuard && typeof window.LicenseGuard.unlock === 'function') {
            window.LicenseGuard.unlock();
        }
        localStorage.clear();
        products = [];
        displayProducts();
        showSuccessNotification();
    }
}

// Функция для показа уведомления об успехе
function showSuccessNotification() {
    if (!successNotification) return;
    successNotification.classList.add('show');
    setTimeout(() => {
        successNotification.classList.remove('show');
    }, 2000);
}
