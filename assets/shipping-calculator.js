document.addEventListener('DOMContentLoaded', function() {
  const countrySelect = document.getElementById('address_country');
  if (!countrySelect) {
    return;
  }

  const stateSelect = document.getElementById('address_state');
  const countryStateWrapper = document.getElementById('address_state_container');
  const stateLabel = document.getElementById('address_state_label');
  const zipContainer = document.getElementById('address_zip_container');
  const calculateShippingButton = document.getElementById('calculate-shipping');
  const zipInput = document.getElementById('address_zip');
  const ratesContainer = document.getElementById('shipping-rates-container');
  const errorsContainer = document.getElementById('shipping-errors-container');
  const ratesList = document.getElementById('shipping-rates-list');
  const errorsDiv = document.getElementById('shipping-errors');

  function updateCalculateButtonVisibility() {
    const selectedCountry = countrySelect.options[countrySelect.selectedIndex];
    const countryIsValid = selectedCountry.hasAttribute('data-provinces') && countrySelect.value !== '---';
    const zipIsValid = zipInput.value.trim() !== '';

    if (countryIsValid && zipIsValid) {
      calculateShippingButton.style.display = '';
    } else {
      calculateShippingButton.style.display = 'none';
    }
  }

  function setupStates() {
    const selectedCountry = countrySelect.options[countrySelect.selectedIndex];
    const states = JSON.parse(selectedCountry.getAttribute('data-provinces') || '[]');

    stateSelect.innerHTML = '';
    if (states.length) {
      for (const state of states) {
        const option = document.createElement('option');
        option.value = state[1];
        option.textContent = state[0];
        stateSelect.appendChild(option);
      }
      countryStateWrapper.style.display = '';
    } else {
      countryStateWrapper.style.display = 'none';
    }

     //TODO: verify that placeholder country value is consistent and reliable, otherwise may need another method here.
    const countryIsValid = selectedCountry.hasAttribute('data-provinces') && countrySelect.value != "---";
    if (countryIsValid) {
      zipContainer.style.display = '';
    } else {
      zipContainer.style.display = 'none';
    }

    const stateLabelText = selectedCountry.getAttribute('data-province-label') || 'State';
    stateLabel.textContent = stateLabelText;
    
    updateCalculateButtonVisibility();
  }

  async function getShippingRates() {
    const country = countrySelect.value;
    const state = stateSelect.value;
    const zip = zipInput.value;

    const response = await fetch('/cart/shipping_rates.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipping_address: {
          zip: zip,
          country: country,
          province: state
        }
      })
    });

    const data = await response.json();

    ratesList.innerHTML = '';
    errorsDiv.innerHTML = '';
    ratesContainer.style.display = 'none';
    errorsContainer.style.display = 'none';

    if (data.shipping_rates && data.shipping_rates.length > 0) {
      data.shipping_rates.forEach(rate => {
        const li = document.createElement('li');
        li.textContent = `${rate.name}: ${rate.price}`;
        ratesList.appendChild(li);
      });
      ratesContainer.style.display = '';
    } else {
      let errorHtml = '';
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          errorHtml += `<p>${key}: ${data[key]}</p>`;
        }
      }
      errorsDiv.innerHTML = errorHtml || 'COULD NOT FIND SHIPPING RATES.';
      errorsContainer.style.display = '';
    }
  }

  zipInput.addEventListener('input', updateCalculateButtonVisibility);
  countrySelect.addEventListener('change', setupStates);
  calculateShippingButton.addEventListener('click', getShippingRates);

  setupStates();
}); 