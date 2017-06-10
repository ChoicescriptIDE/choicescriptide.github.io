$(window).load(function() {
	$('.section-header').hover(function() {
			$(this).animate({opacity: "1"}, 200);
		}, function() {
			if($(this).find("div").first().css("height") == "0px") {
				$(this).animate({opacity: "0.5"}, 200);
			}
		})
		.on("click", function() {			
			$('.active').find("div").first().animate({height: "0px", padding: "0px"}, 400).parent().removeClass("active").addClass("inactive");
			
		if ($(this).find("div").first().css("height") == "0px") {
			$(this).removeClass("inactive");
			$(this).addClass("active");
			$(this).find("div").first().animate({height: "300px", padding: "10px"}, 400);
		}
		else {
			$(this).removeClass("active");
			$(this).addClass("inactive");
			$(this).animate({opacity: "0.5"}, 200);
			$(this).find("div").first().animate({height: "0px", padding: "0px"}, 400);
		}
	});
	$('.section-header').children().click(function(e) {
        e.stopPropagation();
   });
   
   $('#help-menu li').hover(function() {
		$(this).animate({opacity: "1"}, 200);
	}, function() {
		if($(this).find("div").first().css("height") == "0px") {
			$(this).animate({opacity: "0.5"}, 200);
		}
	})
	.on("click", function() {
		if (($('#help-menu li').is('animated')) || ($('#help-menu div').is(':animated'))) return;
		var detail = $(this).find("div").first();
		if (detail.css("height") == "0px") {
			 var clicked = $(this);
			 $('#help-menu li').animate({right: "-200%"}, 400, function() {
				$(this).not(clicked).hide();
				clicked.animate({right: "0%"}, 400);
			 });
			 detail.animate({height: "140px"}, 400);
		}
		else {
			 detail.animate({height: "0px"}, 400);
			 $('#help-menu li').not($(this)).show();
			 $('#help-menu li').not($(this)).animate({right: "0%"}, 400);
		}
	});
});

