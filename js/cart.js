const storedCart = localStorage.getItem('cart');
const token = localStorage.getItem('token');
const api = 'https://students.trungthanhweb.com/api/';
const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
});

const cartWrapper = `
    <div class="col">
        <div class="border border-light-subtle bg-white rounded-4 p-4">
            <div class="container">
                <div class='row py-5'>
                    <div class='col py-5 text-center text-body-tertiary'>
                        <i class="bi bi-bag-x-fill fs-1 d-block text-secondary"></i>
                        <p>Giỏ hàng trống</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

$(document).ready(function () {
    const ckInput = new checkInput();
    const tenKhInput = $('#tenKH'); const invalidName = $('#invalidName');
    const phoneInput = $('#phone'); const invalidPhone = $('#invalidPhone');
    const addressInput = $('#address'); const invalidAddress = $('#invalidAddress');
    login();
    logout();
    checkInfo();
    showCart();
    
    function checkInput() {
        this.checkNull = function (value) {
            value = value.trim();
            return value === '' ? false : true;
        };
        
        this.checkNumber = function (number) {
            let regex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
            return regex.test(number);
        };
    }

    function validateInput(inputElement, errorElement, errorMsg, checkFunction) {
        const inputValue = inputElement.val().trim();
        const isValid = checkFunction(inputValue);
        if (!isValid) {
            inputElement.removeClass('is-valid');
            inputElement.addClass('is-invalid');
            errorElement.text(errorMsg);
            err = true;
        } else {
            inputElement.addClass('is-valid');
            inputElement.removeClass('is-invalid');
        }

    }

    tenKhInput.on('blur', function() {
        validateInput(tenKhInput, invalidName, 'Chưa nhập tên!', ckInput.checkNull);
    });

    phoneInput.on('blur', function() {
        const phone = phoneInput.val().trim();
        if (!ckInput.checkNull(phone)) {
            errorMsg = 'Chưa nhập số điện thoại!';
            validateInput(phoneInput, invalidPhone, errorMsg, ckInput.checkNull);
        } else {
            errorMsg = 'Số điện thoại không đúng!';
            validateInput(phoneInput, invalidPhone, errorMsg, ckInput.checkNumber);
        }
    });

    addressInput.on('blur', function() {
        validateInput(addressInput, invalidAddress, 'Chưa nhập địa chỉ!', ckInput.checkNull);
    });

    $('#checkOutBtn').click(function (e) { 
        e.preventDefault();
        const isValid = $('.is-valid');
        const isInvalid = $('#checkOutInfo');
        if (isValid.length === 3) {
            const cart = JSON.parse(storedCart);
            const tenKH = tenKhInput.val().trim();
            const phone = phoneInput.val().trim();
            const address = addressInput.val().trim();
            $.ajax({
                type: "POST",
                url: api+'createBill',
                data: {apitoken:token,tenKH,phone,address,cart},
                dataType: "JSON",
                success: function (res) {
                    if (res) {
                        localStorage.removeItem('cart');
                        $('#container').html(`
                            <div class="row">
                                <div class="col">
                                    <div class="border border-light-subtle bg-white rounded-4 p-4">
                                        <div class="container">
                                            <div class='row py-5'>
                                                <div class='col py-5 text-center text-body-tertiary'>
                                                    <i class="bi bi-bag-check-fill fs-1 d-block text-success"></i>
                                                    <p>Đặt hàng thành công</p>
                                                    <p>Sẽ tự động chuyển về trang chủ sau <span id="countdown" class="text-danger"></span> giây</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`)

                        let countdown = 5;
                        const countdownInterval = setInterval(function() {
                            if (countdown > 0) {
                                $('#countdown').text('0'+countdown);
                                countdown--;
                            } else {
                                clearInterval(countdownInterval);
                                window.location.replace('index.html');
                            }
                        }, 1000);

                        Toast.fire({
                            icon: 'success',
                            title: '🙇🏻‍♂️ Xin cảm ơn!'
                        })
                    }
                }
            });
        } else {
            isInvalid.addClass('border-danger bg-danger-subtle text-danger');
            tenKhInput.addClass('border-danger');
            phoneInput.addClass('border-danger');
            addressInput.addClass('border-danger');
            isInvalid.removeClass('border-light-subtle bg-white');
            isInvalid.css('transform', 'scale(1.04)');
            setTimeout(function() {
                tenKhInput.removeClass('border-danger');
                phoneInput.removeClass('border-danger');
                addressInput.removeClass('border-danger');
                isInvalid.removeClass('border-danger bg-danger-subtle text-danger');
                isInvalid.css('transform', 'scale(1)');
            }, 500);
        }
    });
});

function formatCurrency(e) {
    e = e.toString();
    e = e.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return e;
}

function checkInfo() {
    if (token&&token!==null) {
        $('#login,#login-mb,#info').hide();
    } else {
        $('#logout,#logout-mb,#productsList,#brands,#categories').hide();
        $('#cartWrapper').html(cartWrapper);
        $('#cartCount,#cartCount-mb').text('0');
    }
}

function login() {
    $('#loginBtn,#loginBtn-mb').click(function (e) {
        e.preventDefault();
        const emailInput = $('#email');
        const submitBtn = $('#submitBtn');
        const loginModal = $('#loginModal');
        loginModal.modal('show');
        emailInput.keyup(function () {
            const email = emailInput.val().trim();
            submitBtn.toggleClass('disabled', email === '')
        })
        submitBtn.click(function (e) { 
            e.preventDefault();
            const email = emailInput.val().trim();
            $.ajax({
                type: 'POST',
                url: 'https://students.trungthanhweb.com/api/checkLoginhtml',
                data: {email},
                dataType: 'JSON',
                success: function (res) {
                    if(res.check){
                        Toast.fire({
                            icon: 'success',
                            title: 'Ngon lành, chờ xíu nha!'
                        }).then(()=>{
                            localStorage.setItem('token',res.apitoken);
                            window.location.reload();
                        });
                    } else {
                        Toast.fire({
                            icon: 'error',
                            title: 'Email không đúng!'
                        });
                    }
                }
            });
        });
    });
}

function logout() {
    $('#logoutBtn,#logoutBtn-mb').click(function (e) { 
        e.preventDefault();
        if (token&&token!==null) {
            localStorage.removeItem('token');
            localStorage.removeItem('cart');
        }
        Toast.fire({
            icon: 'success',
            title: 'OK, See ya!'
        }).then(()=>{
            $('#container').html(`
                <div class="row">
                    <div class="col">
                        <div class="border border-light-subtle bg-white rounded-4 p-4">
                            <div class="container">
                                <div class='row py-5'>
                                    <div class='col py-5 text-center text-body-tertiary'>
                                        <i class="bi bi-emoji-kiss-fill fs-1 d-block text-danger"></i>
                                        <p>Đã đăng xuất</p>
                                        <p>Sẽ tự động chuyển về trang chủ sau <span id="cdLogout" class="text-danger"></span> giây</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`)

            let countdown = 5;
            const countdownInterval = setInterval(function() {
                if (countdown > 0) {
                    $('#cdLogout').text('0'+countdown);
                    countdown--;
                } else {
                    clearInterval(countdownInterval);
                    window.location.replace('index.html');
                }
            }, 1000);
        });
    });
}

function showCart() {
    if (storedCart&&storedCart!==null) {
        let cart = JSON.parse(storedCart);
        $('#cartCount,#cartCount-mb').text(cart.length);
        $.ajax({
            type: "GET",
            url: api+"getCart",
            data: {apitoken:token,id:cart},
            dataType: "JSON",
            success: function (res) {
                const brands = res.brands;
                const categories = res.categrories;
                const cart = res.result;
                if (Array.isArray(brands) && brands.length) {
                    str = '';
                    brands.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="brand.html?id=${e.id}">${e.name}</a></li>`;
                    });
                    $('#brands').html(str);
                }
                if (Array.isArray(categories) && categories.length) {
                    str = '';
                    categories.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="category.html?id=${e.id}">${e.name}</a></li>`;
                    });
                    $('#categories').html(str);
                }
                if (Array.isArray(res.result) && res.result.length) {
                    let str = '';
                    let total = 0;
                    cart.forEach(e => {
                        str+=`
                            <tr>
                                <td scope="row" class="border-top py-4" style="width: 10%;">
                                    <img src="${e[3]}" alt="${e[1]}" class="img-fluid">
                                </td>
                                <td class="border-top py-4"><a href="product.html?id=${e[0]}">${e[1]}</a></td>
                                <td class="border-top py-4">${formatCurrency(e[5])}</td>
                                <td class="border-top py-4">
                                    <div class="btn-group" role="group">
                                        <button type="button" role="button" class="btn btn-sm bg-secondary-subtle text-primary border-0 ${e[4]===1?'disabled':''}" onclick="decOne(this)">–</button>
                                        <input type="number" readonly class="btn btn-sm bg-secondary-subtle border-0" name="quantity" value="${e[4]}" data-id="${e[0]}" style="width: 40px">
                                        <button type="button" role="button" class="btn btn-sm bg-secondary-subtle text-primary border-0" onclick="incOne(this)">+</button>
                                    </div>
                                </td>
                                <td class="border-top py-4">${formatCurrency(e[6])}</td>
                                <td class="border-top py-4 text-center">
                                    <i role="button" class="bi bi-trash fs-5 d-block text-secondary trash" data-id="${e[0]}" onclick="deleteProduct(this)"></i>
                                </td>
                            </tr>`;
                        total+=e[6];
                    })
                    $('#cart').html(str);
                    $('#total').html(formatCurrency(total));
                }
            }
        });
    } else {
        $('#cartWrapper').html(cartWrapper);
        $.ajax({
            type: "GET",
            url: api+"home",
            data: {apitoken:token},
            dataType: "JSON",
            success: function (res) {
                const brands = res.brands;
                const categories = res.categrories;
                if (Array.isArray(brands) && brands.length) {
                    str = '';
                    brands.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="brand.html?id=${e.id}">${e.name}</a></li>`;
                    });
                    $('#brands').html(str);
                }
                if (Array.isArray(categories) && categories.length) {
                    str = '';
                    categories.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="category.html?id=${e.id}">${e.name}</a></li>`;
                    });
                    $('#categories').html(str);
                }
            }
        });
    }
}

function incOne(e) {
    let input = $(e).prev();
    let value = parseInt(input.val(), 10);
    let id = parseInt(input.attr('data-id'),10);
    value = isNaN(value) ? 0 : value;
    value++;
    input.val(value);
    updateCart(id,value);
}

function decOne(e) {
    let input = $(e).next();
    let value = parseInt(input.val(), 10);
    let id = parseInt(input.attr('data-id'),10);
    value = isNaN(value) ? 0 : value;
    if (value > 1) {
        value--;
        input.val(value);
    } else {
        $(e).toggleClass('disabled');
    }
    updateCart(id,value);
}

function updateCart(id,quantity) {
    let currentCart = JSON.parse(storedCart);
    currentCart.forEach(e => {
        if (e[0]===id) {
            e[1] = quantity;
        }
    });
    localStorage.setItem('cart',JSON.stringify(currentCart));
    Toast.fire({
        icon: 'info',
        title: 'Chờ xíu nhe!'
    }).then(()=>{window.location.reload()});
}

function deleteProduct(el) {
    let currentCart = JSON.parse(storedCart);
    let id = parseInt($(el).attr('data-id'),10);
    currentCart = currentCart.filter(e => e[0]!==id);

    // Trường hợp dùng forEach
    // 
    // currentCart.forEach((e,i) => {
    //     if(e[0]===id) {
    //         currentCart.splice(i,1);
    //     }
    // });
    // 

    Swal.fire({
        title: 'Xóa hả?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Ừm!',
        denyButtonText: 'Nhầm bạn!',
    }).then((result) => {
        if (result.isConfirmed) {
            if (currentCart.length===0) {
                localStorage.removeItem('cart');
            } else {
                localStorage.setItem('cart',JSON.stringify(currentCart));
            }
            Toast.fire({
                icon: 'success',
                title: 'Xong rồi, chờ xíu nhe!'
            }).then(()=>{window.location.reload()});
        } else if (result.isDenied) {
            Toast.fire({
                icon: 'info',
                title: 'Ok!'
            });
        }
    })
}
