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
    loadData();
    loadMore();
    checkInfo();
});

function checkInfo() {
    if (token&&token!==null) {
        $('#login,#login-mb,#info').hide();
    } else {
        $('#logout,#logout-mb,#productsList,#brands,#categories').hide();
    }
}

function formatCurrency(e) {
    e = e.toString();
    e = e.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return e;
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
        }).then(()=>{ window.location.reload(); });
    });
}

let link = api+'home'; 
function loadData() {
    if (token&&token!==null) {
        $.ajax({
            type: "GET",
            url: link,
            data: {apitoken:token},
            dataType: "JSON",
            success: function (res) {
                const brands = res.brands;
                const categories = res.categrories;
                const products = res.products.data;
                if (brands.length) {
                    str = '';
                    brands.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="#">${e.name}</a></li>`;
                    });
                    $('#brands').html(str);
                }
                if (categories.length) {
                    str = '';
                    categories.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="#">${e.name}</a></li>`;
                    });
                    $('#categories').html(str);
                }
                if (products.length) {
                    str = '';
                    products.forEach(e => {
                        str+=`
                        <div class="col">
                            <div class="card rounded-4 pt-3 bg-white border-light-subtle">
                                <img src="${imgSrc+e.images}" class="card-img-top" alt="${e.name}">
                                <div class="card-body">
                                    <p>
                                        <span class="badge text-bg-secondary">${e.catename}</span>
                                        <span class="badge text-bg-dark">${e.brandname}</span>
                                    </p>
                                    <h5 class="card-title">${e.name}</h5>
                                    <p class="card-text text-danger">${formatCurrency(e.price)}</p>
                                    <div class="d-grid d-lg-flex gap-2 gap-lg-1">
                                        <button class="btn btn-sm rounded-3 btn-outline-secondary me-0 me-lg-2" data-id="${e.id}">Xem</button> 
                                        <button class="btn btn-sm rounded-3 btn-danger addToCart" data-id="${e.id}"><i class="bi bi-bag-plus me-1"></i>Thêm vào giỏ</button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    });
                    $('#products').append(str);
                    if (res.products.next_page_url!==null) {
                        link = res.products.next_page_url;
                    } else {
                        $('#loadMore').attr('disabled',true).text('😅 Hết rồi fen');
                    }
                }
                addToCart();
                searchProduct();
            }
        });
    }
}

function loadMore() {
    $('#loadMore').click(function (e) { 
        e.preventDefault();
        loadData();
    });
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

function searchProduct() {
    const inputSearch = $('#inputSearch');
    const currentProducts = $('#products').html();
    inputSearch.on('keyup',_.debounce(function () {
        let name = inputSearch.val().trim();
        if (name!=='') {
            $.ajax({
                type: "GET",
                url: api+"getSearchProducts",
                data: {apitoken:token,name},
                dataType: "JSON",
                success: function (res) {
                    let products = res.result;
                    if (products.length) {
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
                                        <button class="btn btn-sm rounded-3 btn-outline-secondary me-2" data-id="${e.id}">Xem</button> 
                                        <button class="btn btn-sm rounded-3 btn-danger addToCart" data-id="${e.id}"><i class="bi bi-bag-plus me-1"></i>Thêm vào giỏ</button>
                                    </div>
                                </div>
                            </div>`;
                        });
                        $('#products').html(str);
                        $('#loadMore').hide();
                    }
                    addToCart();
                }
            });
        } else {
            $('#products').html(currentProducts);
            $('#loadMore').show();
        }
    },2000));
}