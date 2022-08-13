// ==UserScript==
// @name         Lightbox
// @version      0.2
// @description  Adds a lightbox to Pillowfort.social.
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.pillowfort.social/assets/favicon/Favicon%202%20-%20Dark%20Blue@3x-d11c16147c2ce6136e0925765773e734b35102fe045adf98f1d9cf71040d8d05.png
// @updateURL
// @downloadURL
// @supportURL
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* Initialize */
    var loadingIndicator = document.getElementById("home_loading") || document.getElementById("blog_loading") || document.getElementsByClassName("comments-container")[0];//document.getElementById("comments_loading");
    var styleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (loadingIndicator.style.display == "none") {//for home-feed and blogs
                loadImgs();
            } else if (loadingIndicator.classList.contains("comments-container")) {//for single posts
                loadImgs();
                loadComments();
            }
        });
    });
    if (loadingIndicator) {
        styleObserver.observe(loadingIndicator, {
            attributes: true,
            attributeFilter: ["style"],
            childList: true
        });
    }
    var activeImages = [];
    var blurElements = [];
    blurElements.push(document.getElementById("homeFeedCtrlId") || (document.getElementById("userBlogPosts") ? document.getElementById("userBlogPosts") : document.getElementById("single-post-container")));
    blurElements.push(document.getElementsByClassName("site-sidebar")[0]);
    if (document.getElementById("userBlogPosts")) {
        blurElements.push(document.getElementById("user-sidebar-expanded"));
        blurElements.push(document.getElementById("sidebar-collapsed"));
    }
    document.addEventListener("keydown", keyWatch);

    /* Find all images in posts. */
    function loadImgs() {
        let posts = document.getElementsByClassName("post-container");
        for (let post of posts) {
            let images = post.getElementsByTagName("img");
            let index = 0;
            for (let image of images) {
                if (image.classList.contains("fullscreenprocessed")) continue;
                if (!((image.classList.contains("full") || image.classList.contains("half") || image.classList.contains("fr-draggable") || image.classList.contains("fr-fic")) && image.src != "")) continue;
                formatImage(image);
                image.setAttribute("imageindex", index);
                index++;
            }
        }
    }

    /* Find all images in comments. */
    function loadComments() {
        console.log("load comments");
        let comments = document.getElementsByClassName("display-comment");
        for (let comment of comments) {
            let images = comment.getElementsByTagName("img");
            let index = 0;
            for (let image of images) {
                if (image.classList.contains("fullscreenprocessed")) continue;
                formatImage(image);
                image.setAttribute("imageindex", index);
                image.classList.add("commentimage");
                index++;
            }
        }
    }

    /* Add formating and click-event to images. */
    function formatImage(image) {
        image.classList.add("fullscreenprocessed");
        if (image.parentNode.href) {
            if (image.parentNode.href.search("pillowfort.social") == 13) {
                image.setAttribute("fullres", image.parentNode.href || image.src);
            } else {
                let linkDiv = document.createElement("div");
                linkDiv.style.position = "relative";
                linkDiv.style.top = "0";
                let linkA = document.createElement("a");
                linkA.style.position = "absolute";
                linkA.style.left = "0";
                linkA.href = image.parentNode.href;
                linkA.target = "_blank";
                let linkIcon = document.createElement("img");
                linkIcon.style.background = "white";
                linkIcon.style.opacity = "0.5";
                linkIcon.style.width = "30px";
                linkIcon.style.position = "absolute";
                linkIcon.style.padding = "2px";
                linkIcon.src = "https://www.pillowfort.social/assets/global/link-39d881d9f1f3bc335127686b0cb7f4490485637c596ccb318282de38053cf716.svg";
                linkIcon.addEventListener("mouseenter", function(){hoverIn(this)});
                linkIcon.addEventListener("mouseleave", function(){hoverOut(this)});
                linkA.appendChild(linkIcon);
                linkDiv.appendChild(linkA);
                image.parentNode.insertBefore(linkDiv, image);
                image.setAttribute("fullres", image.src);
            }
        } else {
            image.setAttribute("fullres", image.src);
        }
        image.parentNode.removeAttribute("href");
        image.style.cursor = "zoom-in";
        image.addEventListener("click", function(){display(this)});
    }

    /* Generate lightbox. */
    function display(element) {
        if (document.getElementById("fullimagebackground")) document.getElementById("fullimagebackground").remove();

        // Find relevant images.
        let images = [];
        if (element.classList.contains("fullimagebutton")) {
            images = activeImages;
        } else if (element.classList.contains("commentimage")) {
            let comment = element;
            while (!comment.classList.contains("display-comment")) {
                comment = comment.parentNode;
            }
            images = comment.getElementsByClassName("fullscreenprocessed");
            activeImages = images;
        } else {
            let post = element;
            while (!post.classList.contains("post")) {
                post = post.parentNode;
            }
            images = post.getElementsByClassName("fullscreenprocessed");
            activeImages = images;
        }
        let id = element.getAttribute("imageindex")*1;

        // Generate background
        let bg = document.createElement("div");
        bg.id = "fullimagebackground";
        bg.style.position = "fixed";
        let top = document.getElementsByTagName("nav")[0] ?
            document.getElementsByTagName("nav")[0].clientHeight : document.getElementById("userTopNavContainer") ?
            document.getElementById("userTopNavContainer").clientHeight : 0;
        bg.style.top = top + "px";
        bg.style.right = "0";
        bg.style.bottom = "0";
        bg.style.left = "0";
        bg.style.backgroundColor = "#0009";
        bg.style.zIndex = "999";
        bg.style.cursor = "pointer";
        bg.style.overflow = "hidden";

        // Generate arrow buttons
        for (let a = 0; a < 2; a++) {
            if ((id <= 0 && a == 0) || (id >= images.length-1 && a == 1)) continue;
            let newId = a == 0 ? id-1 : id+1;
            console.log(newId);
            let button = document.createElement("div");
            button.id = "fullimage"+a;
            button.setAttribute("imageindex", newId);
            button.classList.add("fullimagebutton");
            button.addEventListener("click", function(){display(this)});
            button.addEventListener("mouseenter", function(){hoverIn(this)});
            button.addEventListener("mouseleave", function(){hoverOut(this)});
            button.style.position = "fixed";
            button.style.top = "50%";
            if (a == 0) {
                button.style.left = "0";
            } else {
                button.style.right = "0";
            }
            button.style.width = "40px";
            button.style.height = "40px";
            button.style.marginTop = "-20px";
            button.style.backgroundColor = "#232b40";
            button.style.opacity = "0.5";

            let arrow = document.createElement("div");
            if (a == 0) {
                arrow.style.borderWidth = "0 0 5px 5px";
                arrow.style.margin = "10px 14px";
            } else {
                arrow.style.borderWidth = "5px 5px 0 0";
                arrow.style.margin = "10px 6px";
            }
            arrow.style.borderColor = "#57b5dc";
            arrow.style.borderStyle = "solid";
            arrow.style.width = "50%";
            arrow.style.height = "50%";
            arrow.style.transform = "rotate(45deg)";

            button.appendChild(arrow);
            bg.appendChild(button);
        }

        // Generate image element
        let img = document.createElement("img");
        img.id = "fullimageimage";
        img.src = images[id].getAttribute("fullres");
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.addEventListener("click", close);
        bg.appendChild(img);

        // Generate link button
        let link = document.createElement("a");
        link.href = img.src;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = "link to post";
        link.innerHTML = "<img style='width: 30px; margin: 5px; filter: invert(50%) sepia(100%) saturate(1835%) hue-rotate(161deg) brightness(107%) saturate(52%);' src='/assets/global/link-39d881d9f1f3bc335127686b0cb7f4490485637c596ccb318282de38053cf716.svg'>";
        link.style.position = "fixed";
        link.style.top = top+"px";
        link.style.right = "0";
        link.style.background = "#232b40";
        link.style.width = "40px";
        link.style.height = "40px";
        link.style.opacity = "0.5";
        link.addEventListener("mouseenter", function(){hoverIn(this)});
        link.addEventListener("mouseleave", function(){hoverOut(this)});
        bg.appendChild(link);

        document.getElementsByTagName("body")[0].appendChild(bg);
        for (let element of blurElements) element.style.filter = "blur(2px)";
    }

    /* Remove lightbox. */
    function close() {
        activeImages = [];
        for (let element of blurElements) element.style.filter = "none";
        document.getElementById("fullimagebackground").remove();
    }

    function hoverIn(el) {
        el.style.opacity = "1";
    }

    function hoverOut(el) {
        el.style.opacity = "0.5";
    }

    function keyWatch(e) {
        if (e.key === "ArrowRight" && document.getElementById("fullimage1")) {
            document.getElementById("fullimage1").click();
        } else if (e.key === "ArrowLeft" && document.getElementById("fullimage0")) {
            document.getElementById("fullimage0").click();
        } else if (e.key === "Escape" && document.getElementById("fullimagebackground")) {
            close();
        }
    }
})();