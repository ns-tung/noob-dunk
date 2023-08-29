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
        }).then(()=>{window.location.replace('index.html');});
    });
}

function showData() {
    let url = api+'getCateProducts';
    const params = new URLSearchParams(window.location.search);
    if (token||token!==null) {
        if (storedCart||storedCart!==null) {
            let cart = JSON.parse(storedCart);
            $('#cartCount,#cartCount-mb').text(cart.length);
        }
        if (!params.has('id')||params.get('id')==='') {
            window.location.replace('index.html');
        }
        let id = params.get('id');
        let page = 1;
        if (params.has('page')) {
            page = params.get('page');
        }
        $.ajax({
            type: "GET",
            url: url,
            data: {apitoken:token,id,page},
            dataType: "JSON",
            success: function (res) {
                const brands = res.brands;
                const categories = res.categrories;
                const products = res.products.data;
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
                if (Array.isArray(products) && products.length) {
                    const cateName = categories.find(e => e.id.toString() === id).name;
                    $('#productsList').html(`
                        <h1 class="text-center mb-5">${cateName}</h1>
                        <div id="products" class="row row-cols-2 row-cols-md-3 g-3 g-md-4 mb-5">
                        </div>
                        <nav class="text-center mt-3">
                            <ul id="pagination" class="list-unstyled d-inline-flex gap-2"></ul>
                        </nav>`);
                    $('title').text(`Danh mục: ${cateName} – NoobDunk`);
                    str = '';
                    products.forEach(e => {
                        str+=`
                        <div class="col">
                            <div class="card rounded-4 pt-3 bg-white border-light-subtle">
                                <img src="${imgSrc+e.image}" class="card-img-top" alt="${e.name}">
                                <div class="card-body">
                                    <p>
                                        <span class="badge text-bg-secondary">${e.catename}</span>
                                        <span class="badge text-bg-dark">${e.brandname}</span>
                                    </p>
                                    <h5 class="card-title">${e.name}</h5>
                                    <p class="card-text text-danger">${formatCurrency(e.price)}</p>
                                    <div class="d-grid d-lg-flex gap-2 gap-lg-1">
                                        <a href="product.html?id=${e.id}" class="btn btn-sm rounded-3 btn-outline-secondary me-0 me-lg-2" data-id="${e.id}">Xem</a> 
                                        <button class="btn btn-sm rounded-3 btn-danger addToCart" data-id="${e.id}"><i class="bi bi-bag-plus me-1"></i>Thêm vào giỏ</button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    });
                    $('#products').append(str);
                    const lastPage = res.products.last_page;
                    const currentPage = res.products.current_page;
                    pgItem = '';
                    let i = 1;
                    while (i<=lastPage) {
                        if (i===currentPage) {
                            pgItem+=`
                            <li class="pg-item active">
                                <a class="pg-link btn border-light-subtle bg-white text-body-tertiary rounded-3" href="category.html?id=${id}&page=${i}">${i}</a>
                            </li>`
                        } else {
                            pgItem+=`
                            <li class="pg-item">
                                <a class="pg-link btn border-light-subtle bg-white text-body-tertiary rounded-3" href="category.html?id=${id}&page=${i}">${i}</a>
                            </li>`
                        }
                        i++;
                    }
                    $('#pagination').html(pgItem);
                }
                addToCart();
                // searchProduct();
            }
        });
    }
}

function addToCart() {
    let cart = [];
    if (storedCart||storedCart!==null) {
        cart = JSON.parse(storedCart);
        $('#cartCount,#cartCount-mb').text(cart.length);
    }
    $('.addToCart').click(function (e) {
        e.preventDefault();
        let id = Number($(this).attr('data-id'));
        let quantity = 1;
        let product = [id,quantity];

        let check = false;
        cart.forEach(e => {
            console.log(e);
            if (e[0]===id) {
                e[1]++;
                check = true;
            }
            console.log(check);
        });
        if (!check) {
            cart.push(product);
            $('#cartCount').text(cart.length);
        }
        localStorage.setItem('cart',JSON.stringify(cart));
        Toast.fire({
            icon: 'success',
            title: 'Đã thêm vào giỏ!'
        });
    });
}