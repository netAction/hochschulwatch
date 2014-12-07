var data = [];
$.getJSON('../data.json', function(datei) {
	data = datei;
});


$(function() {



	$('input.hochschulsuche').on('propertychange keyup input paste change', function() {
		var resultSelector = $(this).attr('data-result');

		if ($(this).val() == '') {
			// input empty
			$(resultSelector).hide();
			return;
		}

		var f = new Fuse(data.hochschulen, {
			keys: ['name'],
			threshold: 0.4
		});

		var result = f.search( $(this).val() );
		$(resultSelector).empty().fadeIn();
		$(result).each(function(i, hochschule) {
			if (i > 10) return;
			$(resultSelector).append(
				'<li>'+
				'<a href="#">'+
				hochschule.name+
				'</a>'+
				'</li>'
			);
		});

		if (result.length == 0) {
			$(resultSelector).append(
				'<li>'+
				'<em>'+
				'nichts gefunden'+
				'</em>'+
				'</li>'
			);
		}

	}).blur(function() {
		var resultSelector = $(this).attr('data-result');
		$(resultSelector).hide();
	}). trigger('blur');


	// Disable all nonsense links <a href="#">
	$('body').on('click','a[href="#"]',function(e) {
		e.preventDefault();
	});



	// Hochschulen in Länder-Auswahl auf der Startseite filtern
	$('a.land-selector').click(function() {
		var land = $(this).attr('data-land');

		var hochschulen = { hochschulen: [] };
		$.each(data.hochschulen, function(i, hochschule) {
			if(hochschule.bundesland == land) {
				hochschulen.hochschulen.push({
					name: hochschule.name,
					uid: hochschule.uid,
				});
			}
		});

		$('#hochschulen-land-selektion-wrapper').slideDown();
		$('#hochschulen-land-selektion').html( Mustache.render(
			$('#hochschulen-land-selektion-template').html(),
			hochschulen
		));

		$('a.land-selector').addClass('btn-default').removeClass('btn-primary');
		$(this).addClass('btn-primary').removeClass('btn-default');

    $('html, body').animate({
			scrollTop: $('#hochschulen-land-selektion-wrapper').offset().top
		}, 'slow');

	});

	$('#hochschulen-land-selektion').change( function() {
		console.log( $(this).val() );
	});



});
