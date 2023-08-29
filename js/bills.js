const storedCart = localStorage.getItem('cart');
const token = localStorage.getItem('token');
const api = 'https://students.trungthanhweb.com/api/';
const imgSrc = 'https://students.trungthanhweb.com/images/';
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

const orderWrapper = `
    <div class="col">
        <div class="bg-white">
            <div class="container">
                <div class='row py-5'>
                    <div class='col py-5 text-center text-body-tertiary'>
                        <i class="bi bi-clipboard2-x fs-1 d-block text-secondary"></i>
                        <p>Bạn chưa đăng nhập!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

$(document).ready(function () {
    login();
    logout();
    checkInfo();
    showData();
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
        $('#logout,#logout-mb,#brands,#categories').hide();
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
            submitBtn.toggleClass('disabled', email === '');
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

function showData() {
    if (token||token!==null) {
        if (storedCart||storedCart!==null) {
            let cart = JSON.parse(storedCart);
            $('#cartCount,#cartCount-mb').text(cart.length);
        }
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
                        str+=`<li><a class="dropdown-item" href="#">${e.name}</a></li>`;
                    });
                    $('#brands').html(str);
                }
                if (Array.isArray(categories) && categories.length) {
                    str = '';
                    categories.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="#">${e.name}</a></li>`;
                    });
                    $('#categories').html(str);
                }
            }
        });
        $.ajax({
            type: "GET",
            url: api+"bills",
            data: {apitoken:token},
            dataType: "JSON",
            success: function (res) {
                if (res.check) {
                    let str = '';
                    const bills = res.bills;
                    bills.forEach(e=>{
                        str+=`
                            <li role="button" class="list-group-item an-order px-4 py-3 border-top-0 border-end border-bottom-0 border-start-0" data-id="${e.id}">
                                <p class="mb-2 small">#${e.id}</p>
                                <p class="text-body-tertiary mb-2 small">Tên: ${e.tenKH}</p>
                                <p class="text-body-tertiary mb-1 small">Ngày mua: ${e.created_at}</p>
                            </li>`;
                        $('#ordersList').html(str);
                    });
                }
                billDetail();
            }
        });
    } else {
        $('#orderWrapper').html(orderWrapper);
    }
}

function billDetail() {
    $('.an-order').click(function (e) { 
        e.preventDefault();
        $('.list-group-item').removeClass('active text-primary bg-primary-subtle border-2 border-primary');
        $(this).addClass('active text-primary bg-primary-subtle border-2 border-primary');
        const id = $(this).attr('data-id');
        $.ajax({
            type: "GET",
            url: api+"singlebill",
            data: {apitoken:token,id},
            dataType: "JSON",
            success: function (res) {
                if (res.check) {
                    const bill = res.result;
                    const billInfo = res.bill[0];
                    let sum = 0;
                    let str = '';
                    let orderInfo = '';
                    $('#orderDetail').html(`
                        <div id="orderInfo" class="table-responsive"></div>
                        <hr class="opacity-100 border-2">
                        <div class="table-responsive mb-5">
                            <table class="table table-borderless m-0">
                                <thead>
                                <tr>
                                    <th scope="col" class="text-light-emphasis py-4">Ảnh</th>
                                    <th scope="col" class="text-light-emphasis py-4">Tên sản phẩm</th>
                                    <th scope="col" class="text-light-emphasis py-4">Giá</th>
                                    <th scope="col" class="text-light-emphasis py-4">Số lượng</th>
                                    <th scope="col" class="text-light-emphasis py-4">Tổng phụ</th>
                                </tr>
                                </thead>
                                <tbody id="bill" class="table-group-divider"></tbody>
                            </table>
                        </div>`);
                    bill.forEach(e => {
                        str+=`
                            <tr>
                                <td scope="row" class="border-top text-start py-3" style="width:12%">
                                    <img src="${imgSrc+e.image}" alt="${e.productname}" class="img-fluid">
                                </td>
                                <td class="border-top py-3">${e.productname}</td>
                                <td class="border-top py-3">${formatCurrency(e.price)}</td>
                                <td class="border-top py-3">${e.qty<10?'0'+e.qty:e.qty}</td>
                                <td class="border-top py-3 text-primary-emphasis">${formatCurrency(subtotal=e.price*e.qty)}</td>
                            </tr>`;
                        sum+=subtotal;
                    });
                    str+=`
                        <tr>
                            <td scope="row" colspan="4" class="border-top text-light-emphasis py-3 fw-bold">Tổng tiền:</td>
                            <td class="border-top text-primary py-3">${formatCurrency(sum)}</td>
                        </tr>`;

                    $('#bill').html(str);

                    orderInfo+=`
                        <table class="table table-borderless">
                            <thead>
                                <tr>
                                    <th scope="col" colspan="4" class="text-light-emphasis py-3">Thông tin thanh toán</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="border-top py-3">Mã: <span class="text-primary">#${billInfo.id}</span></td>
                                    <td class="border-top py-3">Tên: <span class="text-primary">${billInfo.tenKH}</span></td>
                                    <td class="border-top py-3">Số điện thoại: <span class="text-primary">${billInfo.phone}</span></td>
                                    <td class="border-top py-3">Địa chỉ: <span class="text-primary">${billInfo.address}</span></td>
                                </tr>
                            </tbody>
                        </table>`;
                    $('#orderInfo').html(orderInfo);
                    window.scroll({top: 0, behavior: "smooth"});
                }
            }
        });
    });
}