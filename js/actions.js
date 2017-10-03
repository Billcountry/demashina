/**
 * Created by country on 9/8/17.
 */

function init() {
    var loading = document.querySelector("#loading");
    menu(selector("#menu_ac"));

}

var init_map = function(lon,lat,element){
    var loc = new google.maps.LatLng(lat,lon);
    var map_opts = {
        center: loc,
        zoom: 8,
        panControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(element,map_opts);
};

var pass_state = false;
var conf_state = false;

$('#password_holder').on('hidden.bs.collapse', function () {
    pass_state = false;
}).on('shown.bs.collapse', function () {
    pass_state = true;
    conf_state = false;
    document.querySelector("#btn_one_time").style.visibility = "visible";
    $('#confirm_code_holder').collapse("hide");
});

$('#confirm_code_holder').on('hidden.bs.collapse', function () {
    conf_state = false;
}).on('shown.bs.collapse', function () {
    conf_state = true;
    pass_state = false;
    document.querySelector("#btn_login").style.visibility = "visible";
    $('#password_holder').collapse("hide");
});

$('#new_address_collapse').on('shown.bs.collapse', function () {
    $('#request_address_collapse').collapse("hide");
});

$('#request_address_collapse').on('shown.bs.collapse', function () {
    $('#new_address_collapse').collapse("hide");
});


var clear = function (element) {
    while(element.hasChildNodes()){
        element.removeChild(element.lastChild);
    }
};

function Add_error(error, location, append)
{
    var close = document.createElement("button");
    close.setAttribute("type","button");
    close.setAttribute("class","close");
    close.setAttribute("data-dismiss","alert");
    close.setAttribute("aria-label","Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden","true");
    span.setAttribute("class","fa fa-times-circle");
    close.appendChild(span);

    var div = document.createElement("div");
    var text = document.createTextNode(error);
    div.appendChild(close);
    div.appendChild(text);
    div.setAttribute("class","alert alert-danger alert-dismissible fade show");
    div.setAttribute("role","alert");

    location = selector("#"+location);
    if(append){
        location.appendChild(div);
    }else{
        while (location.hasChildNodes()) {
            location.removeChild(location.lastChild);
        }
        location.appendChild(div);
    }
}

function Add_success(message, location, append)
{
    var close = document.createElement("button");
    close.setAttribute("type","button");
    close.setAttribute("class","close");
    close.setAttribute("data-dismiss","alert");
    close.setAttribute("aria-label","Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden","true");
    span.setAttribute("class"," fa fa-times-circle");
    close.appendChild(span);

    var div = document.createElement("div");
    var text = document.createTextNode(message);
    div.appendChild(close);
    div.appendChild(text);
    div.setAttribute("class","alert alert-success alert-dismissible fade show");
    div.setAttribute("role","alert");

    location = document.querySelector("#"+location);
    if(append){
        location.appendChild(div);
    }else{
        while (location.hasChildNodes()) {
            location.removeChild(location.lastChild);
        }
        location.appendChild(div);
    }
}

var map = undefined;

function perform_address_location(button){
    var holder = button.parentNode;
    var job = add_job("Locating...");
    holder.style.paddingTop = "40px";
    var service = get_location(function (position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        clear(holder);
        holder.style.paddingTop = "inherit";
        holder.style.backgroundColor = "grey";

        // Create a map object and specify the DOM element for display.
        map = new google.maps.Map(holder, {
            center: {lat: latitude, lng: longitude},
            zoom: 15
        });

        // Create A marker
        var marker = new google.maps.Marker({
            position: {lat: latitude, lng: longitude},
            map: map,
            title: "Your Location"
        });

        google.maps.event.addListener(map, 'center_changed', function() {
            // 0.1 seconds after the center of the map has changed,
            // set back the marker position.
            var center = map.getCenter();
            marker.setPosition(center);
        });

        remove_job(job);
    }, function (error) {
        remove_job(job);
        Add_error(error.message,"location_error",false);
        holder.removeChild(holder.firstChild);
        holder.removeChild(holder.firstChild);
        holder.removeChild(holder.firstChild);
        button.style.visibility = "visible";
        button.innerHTML = "Retry";
    });
    if(service.success){
        var span = document.createElement("span");
        span.className = "material material-album animated infinite zoomIn";
        span.style.fontSize = "font-size: large";
        holder.insertBefore(new Text("Locating..."),holder.firstChild);
        var br = document.createElement("br");
        holder.insertBefore(br,holder.firstChild);
        holder.insertBefore(span,holder.firstChild);
        button.style.visibility = "hidden";
    }else{
        button.style.visibility = "visible";
        button.innerHTML = "Retry";
        Add_error(service.message,"location_error",false);
    }
}


function get_location(success,error) {
    if ("geolocation" in navigator) {
        var geo_options = {
            enableHighAccuracy: true,
            maximumAge        : 30000,
            timeout           : 120000
        };
        navigator.geolocation.getCurrentPosition(success, error, geo_options);
    } else {
        return {
            success: false,
            message: "Sorry Geo-Location service not available"
        };
    }
    return {
        success: true,
        message: "Locating..."
    };
}

function login() {
    var email = document.querySelector("#login_email").value;
    if(!pass_state && validator.isEmail(email)){
        // Checks if the email exists then proceeds to display
        var job = add_job("Checking email...");
        $.ajax({
            url: "api.php",
            type: "POST",
            data: {
                email: email,
                action: "account_exists"
            },
            dataType: "json",
            success: function (response) {
                clear(selector("#login_errors"));
                remove_job(job);
                if(response.success){
                    selector("#email_success").innerHTML = "Welcome "+response.message["title"]+" "+response.message["last_name"];
                    selector("#login_email").classList.add("disabled");
                    $('#password_holder').collapse("show");
                }else{
                    Add_error(response.message,"login_errors",false);
                }
            },
            error: function (error) {
                remove_job(job);
                Add_error("An error occurred. Please try again.","login_errors", false);
                console.log(error);
            }
        });
    }else if(pass_state){
        var password = document.querySelector("#login_password").value;
        if(live_validation(document.querySelector("#login_email"),"email",false,['btn_login']) &&
            live_validation(document.querySelector("#login_password"),"password",false,['btn_login'])){
            complete_login(email,password);
        }
    }else{
        live_validation(document.querySelector("#login_email"),"email",false,['btn_login']);
    }
}

var complete_login = function (email, password) {
    var job = add_job("Authenticating user...");
    $.ajax({
        url: "api.php",
        type: "POST",
        data: {
            action: "login",
            email: email,
            password: password
        },
        dataType: "json",
        success: function (response) {
            remove_job(job);
            if(response.success){
                var dt = {
                    "success": true,
                    "message": {
                        "message": "Login Successful",
                        "profile": {
                            "user_id": 1,
                            "title": "Mr",
                            "last_name": "Mwaniki",
                            "user_name": "country",
                            "user_type": "user",
                            "email": "billcountrymwaniki@gmail.com"
                        },
                        "token": "q4,lQxvBYJ@VJx\/s\/VcK"
                    }
                };
                var profile = response.message.profile;
                add_local("user_id",profile.user_id);
                add_local("title",profile.user_id);
                add_local("last_name",profile.user_id);
                add_local("user_name",profile.user_id);
                add_local("user_type",profile.user_id);
                add_local("email",profile.user_id);
                add_local("token",response.message.token);
                add_local("status","logged_in");
                selector("#logged_out").classList.add("d-none");
                if(selector("#logged_in").classList.contains("d-none")){
                    selector("#logged_in").classList.remove("d-none");
                }
            }else{
                Add_error(response.message,"login_errors",false);

                selector("#logged_in").classList.add("d-none");
                if(selector("#logged_out").classList.contains("d-none")){
                    selector("#logged_out").classList.remove("d-none");
                }
            }
        },
        error: function (error) {
            remove_job(job);
            Add_error("An error occurred. Please try again.","login_errors", false);
        }
    });
};

var local_store = {};


var add_local = function(key, data){
    if(window.localStorage){
        localStorage.setItem(key,data);
    }else{
        local_store[key] = data;
    }
};

var read_local = function (key) {
    if(window.localStorage){
        return localStorage.getItem(key);
    }else{
        return local_store[key];
    }
};

var remove_local = function (key) {
    if(window.localStorage){
        localStorage.removeItem(key);
    }else{
        local_store[key] = undefined;
    }
};
var clog = function (data) {
    console.log(data);
};

var selector = function (identity) {
    return document.querySelector(identity);
};

var register = function () {
    var txt_title = selector("#reg_title");
    var txt_l_name = selector("#reg_l_name");
    var txt_f_name = selector("#reg_f_name");
    var txt_m_name = selector("#reg_m_name");
    var txt_u_name = selector("#reg_u_name");
    var txt_phone = selector("#reg_phone");
    var txt_email = selector("#reg_email");
    var txt_dob = selector("#reg_dob");
    if(
        live_validation(txt_l_name,'name',true,['btn_reg']) &&
        live_validation(txt_f_name,'name',true,['btn_reg']) &&
        live_validation(txt_m_name,'name',true,['btn_reg']) &&
        live_validation(txt_u_name,'alphanum',true,['btn_reg']) &&
        live_validation(txt_phone,'phone',true,['btn_reg']) &&
        live_validation(txt_email,'email',true,['btn_reg']) &&
        live_validation(txt_dob,'date',true,['btn_reg'])
    ){
        //title, first_name, middle_name, last_name, user_name, email, phone, extras
        $.ajax({
            url: "api.php",
            type: "POST",
            data: {
                action: "register",
                title: txt_title.value,
                first_name: txt_f_name.value,
                middle_name: txt_m_name.value,
                last_name: txt_l_name.value,
                user_name: txt_u_name.value,
                email: txt_email.value,
                phone: txt_phone.value,
                extras: JSON.stringify({dob: txt_dob.value})
            },
            dataType: "json",
            success: function (response) {
                if(response.success){
                    Add_success(response.message,"reg_errors",false);
                    selector("#btn_reg").style.visibility = "hidden";
                }else{
                    Add_error(response.message,"reg_errors",false);
                }
            },
            error: function (error) {
                Add_error(error,"reg_errors",false);
            }
        });
    }else{
        selector("#btn_reg").style.visibility = "hidden";
        Add_error("Please complete all the fields correctly to continue.","reg_errors",false);
    }
};

function one_time() {
    var email = selector("#login_email").value;
    var password = selector("#reset_pass").value;
    var job = add_job("Sending code...");
    if(!conf_state && live_validation(selector("#login_email"),"email",false,['btn_one_time'])){
        // This checks if the email exists in the system. Then proceeds to send the code to the address before displaying.
        $.ajax({
            url: "api.php",
            type: "POST",
            data: {
                action: "one_time",
                email: selector("#login_email").value
            },
            dataType: "json",
            success: function (response){
                remove_job(job);
                if(response.success){
                    selector("#email_success").innerHTML = "Welcome "+response.message["title"]+" "+response.message["last_name"];
                    selector("#login_email").classList.add("disabled");
                    clog(response.message.code);
                    $('#confirm_code_holder').collapse("show");
                }else{
                    Add_error(response.message,"login_errors",false);
                }
            },
            error: function (error) {
                remove_job(job);
                Add_error("System error, please try again later.","login_errors",false);
            }
        });
    }else if(conf_state){
        if(live_validation(selector("#login_email"),"email",false,['btn_one_time']) &&
            live_validation(selector("#reset_pass"),'conf_code',false,['btn_one_time'])){
            complete_login(email, password);
        }
    }else{
        Add_error("Please fill the fields email and confirmation code to continue","login_errors",false);
    }
}

var working = 0;

function add_job(desc)
{
    var loader = document.querySelector("#loader");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(desc));
    loader.appendChild(span);
    working += 1;
    loader.style.visibility = "visible";
    return loader.childNodes.length -1;
}

function remove_job(id)
{
    var loader = document.querySelector("#loader");
    var span = loader.childNodes[id];
    span.style.display = "none";
    working -= 1;
    if(working===0){
        loader.style.visibility = "hidden";
    }
}

var reset_locator = function (main_form) {
    var map_div = selector("#first_loc");
    clear(map_div);
    main_form.reset();
    var br = document.createElement("br");
    var sp = document.createElement("span");
    var bt = document.createElement("button");
    sp.setAttribute("id","location_error");
    bt.className = "btn btn-primary btn-sm";
    bt.setAttribute("onclick","perform_address_location(this)");
    bt.setAttribute("type","button");
    bt.appendChild(new Text("Locate"));

    map_div.style.backgroundColor = "#eeeeee";
    map_div.style.paddingTop = "40px";

    map = undefined;

    map_div.appendChild(br);
    map_div.appendChild(sp);
    map_div.appendChild(bt);
};

var logged_in = function () {
    var state = read_local('status');
    return state === 'logged_in';
};

var TOAST_LONG = 10;
var TOAST_SHORT = 5;
var timer;

function Toast(message,length)
{
    clearTimeout(timer);
    document.getElementById("message").innerHTML = message;
    document.getElementById("toast").style.display = "block";
    timer = setInterval(function() {
        document.getElementById("message").innerHTML = "";
        document.getElementById("toast").style.display = "none";
        clearTimeout(timer);
    },(length*1000));
}

var hide_all = function () {
    selector("#deliveries").classList.add("d-none");
    selector("#user_address").classList.add("d-none");
    selector("#user_acc").classList.add("d-none");
    selector("#about_us").classList.add("d-none");
    selector("#shop").classList.add("d-none");
};

function menu(element) {
    if(logged_in()){
        selector("#logged_out").classList.add("d-none");
        if(selector("#logged_in").classList.contains("d-none")){
            selector("#logged_in").classList.remove("d-none");
        }
    }else{
        selector("#logged_in").classList.add("d-none");
        if(selector("#logged_out").classList.contains("d-none")){
            selector("#logged_out").classList.remove("d-none");
        }
    }
    var nodes = document.querySelectorAll(".menu");
    var target = element.getAttribute("href");
    for (var key=0; key<nodes.length; key++) {
        var nd = nodes[key];
        if(nd.classList.contains("active")) {
            nd.classList.remove("active");
        }
    }
    if(logged_in() || target === "#shop" || target==="#about_us") {
        element.classList.add("active");

        hide_all();
        selector(target).classList.remove("d-none");
    }else{
        selector("#menu_ac").classList.add("active");
        hide_all();
        if(target !== "#user_acc"){
            Toast("You must be logged to access this function.",TOAST_SHORT);
        }
        selector("#user_acc").classList.remove("d-none");
    }
}

function live_validation(element,type,live,hide){
    hide = typeof hide !== 'undefined'? hide : [];
    var value = element.value;
    var parent = element.parentNode;
    var feed_loc = parent.childNodes[3];
    var feedback = "";
    var success = "";
    var result = true;
    switch (type){
        case "alphanum":
            result = validator.isAlphanumeric(value);
            feedback = "User name can only be alphanumeric(A-Z 0-9)";
            break;
        case "name":
            if(value.length<3 || !validator.isAlpha(value)){
                result = false;
            }
            feedback = "Invalid name. The name can only have alphabets(A-Z) only.";
            break;
        case "email":
            result = validator.isEmail(value);
            feedback = "Email must have the format user@domain.com";
            break;
        case "phone":
            result = validator.isMobilePhone(value,'en-KE');
            feedback = "Invalid phone number.";
            break;
        case "date":
            result = validator.toDate(value);
            if(result===null){
                result = false;
                feedback = "Provided input is not a valid date";
            }else{
                result = true;
            }
            break;
        case "password":
            value = validator.trim(value);
            var score = scorePassword(value);
            var info = checkPassStrength(value);
            success = "Password Score: "+score+"% ("+info+")";
            if(score<48){
                result = false;
                feedback = "Password Score: "+score+"% ("+info+")<br>"+"The system accepts passwords with a score of at least 48%, a strong password includes a combination of letters both CAPS and small, numbers and symbols";
            }
            break;
        case "conf_code":
            value = validator.trim(value);
            result = validator.isNumeric(value) && value.length === 6;
            feedback = "The confirmation code sent to your email address is numerical 6 characters in length";
            break;
    }

    parent.classList.remove("has-success","has-warning","has-danger");
    element.classList.remove("form-control-success","form-control-warning","form-control-danger");
    var vis = "visible";
    if(result){
        parent.classList.add("has-success");
        feed_loc.innerHTML = success;
        element.classList.add("form-control-success");

    }else{
        // Show warning if the user is still typing
        if(live){
            parent.classList.add("has-warning");
            feed_loc.innerHTML = feedback;
            element.classList.add("form-control-warning");
        }else{
            parent.classList.add("has-danger");
            feed_loc.innerHTML = feedback;
            element.classList.add("form-control-danger");
        }
        vis = "hidden";
    }
    for(var i = 0; i<hide.length; i++){
        document.querySelector("#"+hide[i]).style.visibility = vis;
    }

    return result;
}