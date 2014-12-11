$(function() {
	$('input#search-input').on('propertychange keyup input paste change', function() {
		var hochschulPath = $(this).attr('data-hochschulpath');

		if ($(this).val() == '') {
			// input empty
			$('#search-results').hide();
			return;
		}
		if ($(this).data('oldvalue') == $(this).val()) return;
		$(this).data('oldvalue', $(this).val());

		var f = new Fuse(searchdb, {
			keys: ['name'],
			threshold: 0.4
		});

		var result = f.search( $(this).val() );
		$('#search-results').empty().fadeIn();
		$(result).each(function(i, hochschule) {
			if (i > 10) return;
			$('#search-results').append(
				'<li>'+
				'<a href="'+hochschulPath+hochschule.slug+'.html">'+
				hochschule.name+
				'</a>'+
				'</li>'
			);
		});

		if (result.length == 0) {
			$('#search-results').append(
				'<li>'+
				'<em>'+
				'nichts gefunden'+
				'</em>'+
				'</li>'
			);
		}

	});

	// Suchergebnisse schließen, wenn außerhalb geklickt wird
	$(document).click(function(event) {
		if ((!$(event.target).closest('#search-input').length) && (!$(event.target).closest('#search-results').length)) {
			if($('#search-results').is(":visible")) {
				$('#search-results').hide();
			}
		}
	});
	$('#search-results').hide();


	// Disable all nonsense links <a href="#">
	$('body').on('click','a[href="#"]',function(e) {
		e.preventDefault();
	});



	// Hochschulen in Länder-Auswahl auf der Startseite filtern
	$('a.land-selector').click(function() {
		var land = $(this).attr('data-land');


		$('#hochschulen-land-selektion-wrapper').slideDown();
		var selektionHtml = '<option selected="selected" disabled="disabled">Hochschule auswählen</option>';
		$.each(searchdb, function(i, hochschule) {
			if(hochschule.bundesland == land) {
				selektionHtml += '<option value="'+ hochschule.slug +'">'+ hochschule.name +'</option>';
			}
		});
		$('#hochschulen-land-selektion').html(selektionHtml);


		$('a.land-selector').addClass('btn-default').removeClass('btn-primary');
		$(this).addClass('btn-primary').removeClass('btn-default');

    $('html, body').animate({
			scrollTop: $('#hochschulen-land-selektion-wrapper').offset().top
		}, 'slow');

	});

	$('#hochschulen-land-selektion').change( function() {
		window.location.href = 'hochschulen/' + $(this).val() + '.html';
	});


});
