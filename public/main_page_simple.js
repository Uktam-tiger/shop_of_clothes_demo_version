// Простая версия main_page.js для основной страницы
console.log('main_page_simple.js загружен');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен в main_page_simple.js');
    
    // Получаем кнопки
    const addProductBtn = document.getElementById('add_product');
    const warehouseBtn = document.getElementById('warehouse_btn');
    const reportsBtn = document.getElementById('reports_btn');
    const modalWindow = document.getElementById('modal_window');
    const closeModalBtn = document.getElementById('close_modal_window');
    
    // Элементы для работы с изображениями
    const standardFileInput = document.getElementById('standard_file_input');
    const imageSelectedInner = document.getElementById('image_selected_inner');
    const cropperModal = document.getElementById('cropper_modal');
    const cropperImage = document.getElementById('cropper_image');
    const cropperCancel = document.getElementById('cropper_cancel');
    const cropperSave = document.getElementById('cropper_save');
    
    let cropper = null;
    let currentProduct = null; // Для хранения текущего продукта в модалке деталей
    
    // Функция для форматирования цены с пробелами
    function formatPrice(price) {
        return Math.round(price).toLocaleString('ru-RU').replace(/\s/g, ' ');
    }
    
    console.log('Кнопки найдены:', {
        addProduct: !!addProductBtn,
        warehouse: !!warehouseBtn,
        reports: !!reportsBtn,
        modal: !!modalWindow,
        closeModal: !!closeModalBtn,
        fileInput: !!standardFileInput,
        imageContainer: !!imageSelectedInner,
        cropperModal: !!cropperModal
    });
    
    // Кнопка добавления продукта
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            console.log('Кнопка "Добавить продукт" нажата');
            if (modalWindow) {
                modalWindow.style.display = 'flex';
                console.log('Модальное окно открыто');
            } else {
                console.log('Модальное окно не найдено');
            }
        });
        console.log('Событие для кнопки "Добавить продукт" добавлено');
    } else {
        console.log('Кнопка "Добавить продукт" не найдена');
    }
    
    // Кнопка закрытия модального окна
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            console.log('Кнопка закрытия модального окна нажата');
            if (modalWindow) {
                modalWindow.style.display = 'none';
                console.log('Модальное окно закрыто');
            }
        });
        console.log('Событие для кнопки закрытия модального окна добавлено');
    } else {
        console.log('Кнопка закрытия модального окна не найдена');
    }
    
    // Кнопка склада
    if (warehouseBtn) {
        warehouseBtn.addEventListener('click', function() {
            console.log('Кнопка "Склад" нажата');
            window.location.href = 'warehouse_menu.html';
        });
        console.log('Событие для кнопки "Склад" добавлено');
    } else {
        console.log('Кнопка "Склад" не найдена');
    }
    
    // Кнопка отчётов
    if (reportsBtn) {
        reportsBtn.addEventListener('click', function() {
            console.log('Кнопка "Отчёты" нажата');
            window.location.href = 'reports_menu.html';
        });
        console.log('Событие для кнопки "Отчёты" добавлено');
    } else {
        console.log('Кнопка "Отчёты" не найдена');
    }
    
    // Закрытие модального окна при клике вне его
    if (modalWindow) {
        window.addEventListener('click', function(event) {
            if (event.target === modalWindow) {
                modalWindow.style.display = 'none';
                console.log('Модальное окно закрыто при клике вне его');
            }
        });
        console.log('Событие закрытия модального окна при клике вне его добавлено');
    }
    
    // Обработка выбора файла изображения
    if (standardFileInput) {
        standardFileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                console.log('Изображение выбрано:', file.name);
                const reader = new FileReader();
                reader.onload = function(e) {
                    openCropperModal(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                console.log('Выбран неверный файл');
                alert('Пожалуйста, выберите изображение');
            }
        });
        console.log('Событие для выбора файла добавлено');
    }
    
    // Функция открытия модального окна обрезки
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
            
            console.log('Cropper инициализирован');
        } else {
            console.log('Элементы для обрезки не найдены');
        }
    }
    
    // Функция закрытия модального окна обрезки
    function closeCropperModal() {
        if (cropperModal) {
            cropperModal.style.display = 'none';
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            console.log('Модальное окно обрезки закрыто');
        }
    }
    
    // Кнопка отмены обрезки
    if (cropperCancel) {
        cropperCancel.addEventListener('click', function() {
            console.log('Кнопка отмены обрезки нажата');
            closeCropperModal();
        });
        console.log('Событие для кнопки отмены обрезки добавлено');
    }
    
    // Кнопка сохранения обрезки
    if (cropperSave) {
        cropperSave.addEventListener('click', function() {
            console.log('Кнопка сохранения обрезки нажата');
            if (cropper) {
                const canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                    fillColor: 'transparent', // Прозрачный фон
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high'
                });
                
                const croppedImageUrl = canvas.toDataURL('image/png');
                
                                 if (imageSelectedInner) {
                     imageSelectedInner.innerHTML = `
                         <img src="${croppedImageUrl}" alt="Выбранное изображение" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                     `;
                     console.log('Обрезанное изображение сохранено');
                 }
                 
                 closeCropperModal();
                 
                 // Проверяем форму после добавления изображения
                 setTimeout(checkFormValidity, 100);
            }
        });
        console.log('Событие для кнопки сохранения обрезки добавлено');
    }
    
         // Добавляем обработку формы (базовая версия)
     const productForm = document.querySelector('#modal_window_add_product form');
     const submitBtn = document.getElementById('submit_product_form');
     const clearBtn = document.getElementById('clear_product_form');
     
     // Функция проверки заполнения формы
     function checkFormValidity() {
         const productName = document.getElementById('product_name').value.trim();
         const productPrice = document.getElementById('product_price').value;
         const productQuantity = document.getElementById('product_quantity').value;
         const productGender = document.getElementById('product_gender').value;
         const productType = document.getElementById('product_type').value;
         const productDescription = document.getElementById('product_description').value.trim();
         const hasImage = imageSelectedInner && imageSelectedInner.innerHTML.trim() !== '';
         
         const isValid = productName && productPrice && productQuantity && 
                        productGender && productType && productDescription && hasImage;
         
         if (submitBtn) {
             submitBtn.disabled = !isValid;
         }
         
         console.log('Проверка формы:', {
             name: !!productName,
             price: !!productPrice,
             quantity: !!productQuantity,
             gender: !!productGender,
             type: !!productType,
             description: !!productDescription,
             image: hasImage,
             isValid: isValid
         });
     }
    
         // Функция для сохранения продукта в localStorage
     function saveProduct(product) {
         let products = JSON.parse(localStorage.getItem('products') || '[]');
         product.id = Date.now(); // Уникальный ID
         products.push(product);
         localStorage.setItem('products', JSON.stringify(products));
         
                      // Добавляем запись в отчёты о добавлении продукта
             if (window.logAction) {
                 window.logAction('add', {
                     productName: product.name,
                     productImage: product.image,
                     productPrice: product.price,
                     quantity: product.quantity,
                     productGender: product.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(product.type),
                     date: new Date().toISOString()
                 });
             } else {
                 // Fallback если функция logAction недоступна
                 const addHistory = JSON.parse(localStorage.getItem('addHistory') || '[]');
                 const addRecord = {
                     productName: product.name,
                     productImage: product.image,
                     productPrice: product.price,
                     quantity: product.quantity,
                     productGender: product.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(product.type),
                     date: new Date().toISOString(),
                     type: 'add'
                 };
                 addHistory.push(addRecord);
                 localStorage.setItem('addHistory', JSON.stringify(addHistory));
             }
         
         console.log('Продукт сохранен:', product);
     }
     
     // Функция для отображения продуктов в таблице
     function displayProducts() {
         const products = JSON.parse(localStorage.getItem('products') || '[]');
         const tbody = document.querySelector('.products_table tbody');
         
         if (tbody) {
             tbody.innerHTML = '';
             
             products.forEach((product, index) => {
                 const row = document.createElement('tr');
                 row.innerHTML = `
                     <td>${index + 1}</td>
                     <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                     <td>${product.name}</td>
                     <td>${formatPrice(product.price)}</td>
                     <td>${product.quantity}</td>
                     <td>${product.gender === 'male' ? 'Мужской' : 'Женский'}</td>
                     <td>${getProductTypeName(product.type)}</td>
                 `;
                 
                 // Добавляем обработчик клика для просмотра деталей
                 row.style.cursor = 'pointer';
                 row.addEventListener('click', () => showProductDetail(product));
                 
                 tbody.appendChild(row);
             });
             
             console.log('Продукты отображены:', products.length);
         }
     }
     
     // Функция для получения названия типа продукта
     function getProductTypeName(type) {
         const types = {
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
         return types[type] || type;
     }
     
     // Функция для показа деталей продукта
     function showProductDetail(product) {
         console.log('Показать детали продукта:', product);
         
         // Сохраняем текущий продукт
         currentProduct = product;
         
         // Заполняем модальное окно данными продукта
         const detailImage = document.getElementById('detail_product_image');
         const detailName = document.getElementById('detail_product_name');
         const detailPrice = document.getElementById('detail_product_price');
         const detailQuantity = document.getElementById('detail_product_quantity');
         const detailGender = document.getElementById('detail_product_gender');
         const detailType = document.getElementById('detail_product_type');
         const detailDescription = document.getElementById('detail_product_description');
         
         if (detailImage) detailImage.src = product.image;
         if (detailName) detailName.value = product.name;
         if (detailPrice) detailPrice.value = formatPrice(product.price);
         if (detailQuantity) detailQuantity.value = product.quantity;
         if (detailGender) detailGender.value = product.gender === 'male' ? 'Мужской' : 'Женский';
         if (detailType) detailType.value = getProductTypeName(product.type);
         if (detailDescription) detailDescription.value = product.description || '';
         
         // Показываем модальное окно
         const productDetailModal = document.getElementById('product_detail_modal');
         if (productDetailModal) {
             productDetailModal.style.display = 'flex';
             console.log('Модальное окно деталей продукта открыто');
         }
     }
     
     if (productForm) {
         productForm.addEventListener('submit', function(event) {
             event.preventDefault();
             console.log('Форма отправлена');
             
             // Собираем данные из формы
             const product = {
                 name: document.getElementById('product_name').value.trim(),
                 price: parseFloat(document.getElementById('product_price').value),
                 quantity: parseInt(document.getElementById('product_quantity').value),
                 gender: document.getElementById('product_gender').value,
                 type: document.getElementById('product_type').value,
                 description: document.getElementById('product_description').value.trim(),
                 image: imageSelectedInner.querySelector('img').src
             };
             
             // Сохраняем продукт
             saveProduct(product);
             
             // Обновляем отображение
             displayProducts();
             
             // Закрываем модальное окно
             modalWindow.style.display = 'none';
             
             // Очищаем форму
             clearBtn.click();
             
             // Показываем уведомление об успехе
             showSuccessNotification();
             
             console.log('Продукт успешно добавлен!');
         });
         console.log('Событие для формы добавлено');
         
         // Добавляем обработчики для всех полей формы
         const formInputs = productForm.querySelectorAll('input, select, textarea');
         formInputs.forEach(input => {
             input.addEventListener('input', checkFormValidity);
             input.addEventListener('change', checkFormValidity);
         });
         console.log('Обработчики событий для полей формы добавлены');
     }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log('Кнопка очистки формы нажата');
            const inputs = productForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.value = '';
            });
            if (imageSelectedInner) {
                imageSelectedInner.innerHTML = '';
            }
                         if (standardFileInput) {
                 standardFileInput.value = '';
             }
             
             // Проверяем форму после очистки
             checkFormValidity();
        });
        console.log('Событие для кнопки очистки формы добавлено');
    }
    
         console.log('Все события добавлены');
     
     // Обработчик для кнопки "Очистить всё"
     const clearStorageBtn = document.getElementById('clear_storage_btn');
     if (clearStorageBtn) {
         clearStorageBtn.addEventListener('click', function() {
             console.log('Кнопка "Очистить всё" нажата');
             if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
                 localStorage.clear();
                 displayProducts(); // Обновляем таблицу
                 alert('Все данные успешно удалены!');
                 console.log('localStorage очищен');
             }
         });
         console.log('Событие для кнопки "Очистить всё" добавлено');
     } else {
         console.log('Кнопка "Очистить всё" не найдена');
     }
     
     // Обработчик для закрытия модального окна деталей продукта
     const closeProductDetailModal = document.getElementById('close_product_detail_modal');
     if (closeProductDetailModal) {
         closeProductDetailModal.addEventListener('click', function() {
             const productDetailModal = document.getElementById('product_detail_modal');
             if (productDetailModal) {
                 productDetailModal.style.display = 'none';
                 console.log('Модальное окно деталей продукта закрыто');
             }
         });
         console.log('Событие для кнопки закрытия модального окна деталей добавлено');
     } else {
         console.log('Кнопка закрытия модального окна деталей не найдена');
     }
     
     // Закрытие модального окна деталей при клике вне его
     const productDetailModal = document.getElementById('product_detail_modal');
     if (productDetailModal) {
         productDetailModal.addEventListener('click', function(event) {
             if (event.target === productDetailModal) {
                 productDetailModal.style.display = 'none';
                 console.log('Модальное окно деталей закрыто при клике вне его');
             }
         });
         console.log('Событие закрытия модального окна деталей при клике вне его добавлено');
     }
     
     // Обработчики для кнопок действий в модалке деталей продукта
     
     // Кнопка "Продать"
     const sellProductBtn = document.getElementById('sell_product_btn');
     if (sellProductBtn) {
         sellProductBtn.addEventListener('click', function() {
             if (!currentProduct) return;
             openSellProductModal();
         });
         console.log('Событие для кнопки "Продать" добавлено');
     }
     
     // Кнопка "Удалить"
     const deleteProductBtn = document.getElementById('delete_product_btn');
     if (deleteProductBtn) {
         deleteProductBtn.addEventListener('click', function() {
             if (!currentProduct) return;
             openDeleteConfirmModal();
         });
         console.log('Событие для кнопки "Удалить" добавлено');
     }
     
     // Кнопка "Переместить в склад"
     const reserveProductBtn = document.getElementById('reserve_product_btn');
     if (reserveProductBtn) {
         reserveProductBtn.addEventListener('click', function() {
             if (!currentProduct) return;
             openReserveProductModal();
         });
         console.log('Событие для кнопки "Переместить в склад" добавлено');
     }
     
     // Обработчики для модалки продажи
     const closeSellProductModal = document.getElementById('close_sell_product_modal');
     const confirmSellBtn = document.getElementById('confirm_sell_btn');
     const cancelSellBtn = document.getElementById('cancel_sell_btn');
     const sellQuantityInput = document.getElementById('sell_quantity');
     
     if (closeSellProductModal) {
         closeSellProductModal.addEventListener('click', function() {
             const sellProductModal = document.getElementById('sell_product_modal');
             if (sellProductModal) sellProductModal.style.display = 'none';
         });
     }
     
     if (cancelSellBtn) {
         cancelSellBtn.addEventListener('click', function() {
             const sellProductModal = document.getElementById('sell_product_modal');
             if (sellProductModal) sellProductModal.style.display = 'none';
         });
     }
     
     if (confirmSellBtn) {
         confirmSellBtn.addEventListener('click', function() {
             if (!currentProduct) return;
             
             const quantity = parseInt(sellQuantityInput.value) || 0;
             if (quantity > currentProduct.quantity) {
                 alert('Недостаточно товара!');
                 return;
             }
             
             // Выполняем продажу
             currentProduct.quantity -= quantity;
             
             // Сохраняем обновлённый продукт
             const products = JSON.parse(localStorage.getItem('products') || '[]');
             const productIndex = products.findIndex(p => 
                 p.name === currentProduct.name && 
                 p.price === currentProduct.price &&
                 p.type === currentProduct.type
             );
             
             if (productIndex !== -1) {
                 products[productIndex] = currentProduct;
                 localStorage.setItem('products', JSON.stringify(products));
             }
             
             // Добавляем запись в отчёты
             if (window.logAction) {
                 window.logAction('sale', {
                     productName: currentProduct.name,
                     productImage: currentProduct.image,
                     productPrice: currentProduct.price,
                     pricePerUnit: currentProduct.price,
                     quantity: quantity,
                     totalPrice: quantity * currentProduct.price,
                     productGender: currentProduct.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(currentProduct.type),
                     date: new Date().toISOString()
                 });
             } else {
                 // Fallback если функция logAction недоступна
                 const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
                 const saleRecord = {
                     productName: currentProduct.name,
                     productImage: currentProduct.image,
                     productPrice: currentProduct.price,
                     pricePerUnit: currentProduct.price,
                     quantity: quantity,
                     totalPrice: quantity * currentProduct.price,
                     productGender: currentProduct.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(currentProduct.type),
                     date: new Date().toISOString(),
                     type: 'sale'
                 };
                 salesHistory.push(saleRecord);
                 localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
             }
             
             // Закрываем модалку и обновляем отображение
             const sellProductModal = document.getElementById('sell_product_modal');
             if (sellProductModal) sellProductModal.style.display = 'none';
             
             const productDetailModal = document.getElementById('product_detail_modal');
             if (productDetailModal) productDetailModal.style.display = 'none';
             
             displayProducts();
             showSuccessNotification();
             
             console.log('Продажа выполнена:', saleRecord);
         });
     }
     
     if (sellQuantityInput) {
         sellQuantityInput.addEventListener('input', updateSellTotalPrice);
     }
     
     // Обработчики для модалки удаления
     const closeDeleteConfirmModal = document.getElementById('close_delete_confirm_modal');
     const confirmDeleteBtn = document.getElementById('confirm_delete_btn');
     const cancelDeleteBtn = document.getElementById('cancel_delete_btn');
     
     if (closeDeleteConfirmModal) {
         closeDeleteConfirmModal.addEventListener('click', function() {
             const deleteConfirmModal = document.getElementById('delete_confirm_modal');
             if (deleteConfirmModal) deleteConfirmModal.style.display = 'none';
         });
     }
     
     if (cancelDeleteBtn) {
         cancelDeleteBtn.addEventListener('click', function() {
             const deleteConfirmModal = document.getElementById('delete_confirm_modal');
             if (deleteConfirmModal) deleteConfirmModal.style.display = 'none';
         });
     }
     
     if (confirmDeleteBtn) {
         confirmDeleteBtn.addEventListener('click', function() {
             if (!currentProduct) return;
             
             // Добавляем запись в отчёты об удалении
             if (window.logAction) {
                 window.logAction('delete', {
                     productName: currentProduct.name,
                     productImage: currentProduct.image,
                     productPrice: currentProduct.price,
                     quantity: currentProduct.quantity,
                     productGender: currentProduct.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(currentProduct.type),
                     date: new Date().toISOString()
                 });
             } else {
                 // Fallback если функция logAction недоступна
                 const deleteHistory = JSON.parse(localStorage.getItem('deleteHistory') || '[]');
                 const deleteRecord = {
                     productName: currentProduct.name,
                     productImage: currentProduct.image,
                     productPrice: currentProduct.price,
                     quantity: currentProduct.quantity,
                     productGender: currentProduct.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(currentProduct.type),
                     date: new Date().toISOString(),
                     type: 'delete'
                 };
                 deleteHistory.push(deleteRecord);
                 localStorage.setItem('deleteHistory', JSON.stringify(deleteHistory));
             }
             
             // Удаляем продукт
             const products = JSON.parse(localStorage.getItem('products') || '[]');
             const filteredProducts = products.filter(p => 
                 !(p.name === currentProduct.name && 
                   p.price === currentProduct.price &&
                   p.type === currentProduct.type)
             );
             localStorage.setItem('products', JSON.stringify(filteredProducts));
             
             // Закрываем модалки и обновляем отображение
             const deleteConfirmModal = document.getElementById('delete_confirm_modal');
             if (deleteConfirmModal) deleteConfirmModal.style.display = 'none';
             
             const productDetailModal = document.getElementById('product_detail_modal');
             if (productDetailModal) productDetailModal.style.display = 'none';
             
             displayProducts();
             showSuccessNotification();
             
             console.log('Продукт удалён:', currentProduct.name);
         });
     }
     
     // Обработчики для модалки резервирования
     const closeReserveProductModal = document.getElementById('close_reserve_product_modal');
     const confirmReserveBtn = document.getElementById('confirm_reserve_btn');
     const cancelReserveBtn = document.getElementById('cancel_reserve_btn');
     const reserveQuantityInput = document.getElementById('reserve_quantity');
     const reserveReasonSelect = document.getElementById('reserve_reason');
     
     if (closeReserveProductModal) {
         closeReserveProductModal.addEventListener('click', function() {
             const reserveProductModal = document.getElementById('reserve_product_modal');
             if (reserveProductModal) reserveProductModal.style.display = 'none';
         });
     }
     
     if (cancelReserveBtn) {
         cancelReserveBtn.addEventListener('click', function() {
             const reserveProductModal = document.getElementById('reserve_product_modal');
             if (reserveProductModal) reserveProductModal.style.display = 'none';
         });
     }
     
     if (confirmReserveBtn) {
         confirmReserveBtn.addEventListener('click', function() {
             if (!currentProduct) return;
             
             const quantity = parseInt(reserveQuantityInput.value) || 0;
             const reason = reserveReasonSelect.value;
             
             if (quantity > currentProduct.quantity) {
                 alert('Недостаточно товара!');
                 return;
             }
             
             if (!reason) {
                 alert('Выберите причину резервирования!');
                 return;
             }
             
             // Уменьшаем количество в основном продукте
             currentProduct.quantity -= quantity;
             
             // Сохраняем обновлённый продукт
             const products = JSON.parse(localStorage.getItem('products') || '[]');
             const productIndex = products.findIndex(p => 
                 p.name === currentProduct.name && 
                 p.price === currentProduct.price &&
                 p.type === currentProduct.type
             );
             
             if (productIndex !== -1) {
                 products[productIndex] = currentProduct;
                 localStorage.setItem('products', JSON.stringify(products));
             }
             
             // Добавляем в склад
             const warehouseItems = JSON.parse(localStorage.getItem('warehouseItems') || '[]');
             const warehouseItem = {
                 id: Date.now(),
                 name: currentProduct.name,
                 price: currentProduct.price,
                 quantity: quantity,
                 gender: currentProduct.gender,
                 type: currentProduct.type,
                 description: currentProduct.description,
                 image: currentProduct.image,
                 reason: reason,
                 date: new Date().toISOString(),
                 originalRowId: currentProduct.id || Date.now()
             };
             warehouseItems.push(warehouseItem);
             localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
             
             // Добавляем запись в отчёты
             if (window.logAction) {
                 window.logAction('warehouse', {
                     productName: currentProduct.name,
                     productImage: currentProduct.image,
                     productPrice: currentProduct.price,
                     quantity: quantity,
                     productGender: currentProduct.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(currentProduct.type),
                     reason: reason,
                     date: new Date().toISOString()
                 });
             } else {
                 // Fallback если функция logAction недоступна
                 const warehouseHistory = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
                 const warehouseRecord = {
                     productName: currentProduct.name,
                     productImage: currentProduct.image,
                     productPrice: currentProduct.price,
                     quantity: quantity,
                     productGender: currentProduct.gender === 'male' ? 'Мужской' : 'Женский',
                     productType: getProductTypeName(currentProduct.type),
                     reason: reason,
                     date: new Date().toISOString(),
                     type: 'warehouse'
                 };
                 warehouseHistory.push(warehouseRecord);
                 localStorage.setItem('warehouseHistory', JSON.stringify(warehouseHistory));
             }
             
             // Закрываем модалки и обновляем отображение
             const reserveProductModal = document.getElementById('reserve_product_modal');
             if (reserveProductModal) reserveProductModal.style.display = 'none';
             
             const productDetailModal = document.getElementById('product_detail_modal');
             if (productDetailModal) productDetailModal.style.display = 'none';
             
             displayProducts();
             showSuccessNotification();
             
             console.log('Продукт зарезервирован:', warehouseItem);
         });
     }
     
     // Функции для работы с модалками действий
     
     // Открытие модалки продажи
     function openSellProductModal() {
         const sellProductModal = document.getElementById('sell_product_modal');
         const sellQuantityInput = document.getElementById('sell_quantity');
         const sellTotalPriceInput = document.getElementById('sell_total_price');
         
         if (sellProductModal && sellQuantityInput && sellTotalPriceInput && currentProduct) {
             sellQuantityInput.max = currentProduct.quantity;
             sellQuantityInput.value = 1;
             updateSellTotalPrice();
             sellProductModal.style.display = 'flex';
             console.log('Модалка продажи открыта');
         }
     }
     
     // Обновление общей цены при продаже
     function updateSellTotalPrice() {
         const sellQuantityInput = document.getElementById('sell_quantity');
         const sellTotalPriceInput = document.getElementById('sell_total_price');
         
         if (sellQuantityInput && sellTotalPriceInput && currentProduct) {
             const quantity = parseInt(sellQuantityInput.value) || 0;
             const totalPrice = quantity * currentProduct.price;
             sellTotalPriceInput.value = totalPrice;
         }
     }
     
     // Открытие модалки подтверждения удаления
     function openDeleteConfirmModal() {
         const deleteConfirmModal = document.getElementById('delete_confirm_modal');
         if (deleteConfirmModal) {
             deleteConfirmModal.style.display = 'flex';
             console.log('Модалка подтверждения удаления открыта');
         }
     }
     
     // Открытие модалки резервирования
     function openReserveProductModal() {
         const reserveProductModal = document.getElementById('reserve_product_modal');
         const reserveQuantityInput = document.getElementById('reserve_quantity');
         
         if (reserveProductModal && reserveQuantityInput && currentProduct) {
             reserveQuantityInput.max = currentProduct.quantity;
             reserveQuantityInput.value = 1;
             reserveProductModal.style.display = 'flex';
             console.log('Модалка резервирования открыта');
         }
     }
     
     // Функция для показа уведомления об успехе
     function showSuccessNotification() {
         const notification = document.getElementById('success_notification');
         if (notification) {
             notification.classList.add('show');
             
             // Скрываем уведомление через 1,5 секунды
             setTimeout(() => {
                 notification.classList.remove('show');
             }, 1500);
             
             console.log('Уведомление об успехе показано');
         } else {
             console.log('Элемент уведомления не найден');
         }
     }
     
     // Загружаем и отображаем существующие продукты
     displayProducts();
 });  