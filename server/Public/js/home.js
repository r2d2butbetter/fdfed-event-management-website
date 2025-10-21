// filepath: d:\FFSD Project\event-management-website\public\js\home.js

// Accordion functionality
document.addEventListener('DOMContentLoaded', function () {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', function () {
      const accordionItem = this.parentElement;
      const isActive = accordionItem.classList.contains('active');

      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
      });

      // If the clicked item wasn't active, make it active
      if (!isActive) {
        accordionItem.classList.add('active');
      }
    });
  });

  // Auto-submit form on input change
//   const searchForm = document.querySelector('.search-container form');
//   if (searchForm) {
//     const formInputs = searchForm.querySelectorAll('input, select');
    
//     formInputs.forEach(input => {
//       input.addEventListener('change', function() {
//         searchForm.submit();
//       });
//     });
//   }
// });

  const searchForm = document.querySelector('.search-container form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get filter values
      const params = new URLSearchParams(new FormData(searchForm));
      // Optionally update the browser address bar (not required for functionality)
      window.history.replaceState({}, '', '?' + params.toString());

      // Fetch and render events for page 1 with the filters
      loadEvents(1);
    });

    // Optionally, also trigger search on input or select change
    const formInputs = searchForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
      input.addEventListener('change', function() {
        searchForm.dispatchEvent(new Event('submit'));
      });
    });
  }
});

// Load events and set up pagination asynchronously
// async function loadEvents(page = 1) {
//   try {
//     const params = new URLSearchParams({
//       title: new URLSearchParams(window.location.search).get('title') || '',
//       venue: new URLSearchParams(window.location.search).get('venue') || '',
//       category: new URLSearchParams(window.location.search).get('category') || '',
//       page: page
//     });

//     const response = await fetch('/api/events?' + params.toString());
//     if (!response.ok) throw new Error('Network response was not ok');
    
//     const data = await response.json();

//     const container = document.getElementById('event-list');
//     container.innerHTML = '';

//     if (!data.events || data.events.length === 0) {
//       container.innerHTML = '<p>No events found.</p>';
//       return;
//     }

//     // Create 4 * 2 grid layout
//     const rows = 2;
//     const columns = 4;
//     for (let r = 0; r < rows; r++) {
//       const rowDiv = document.createElement('div');
//       rowDiv.style.display = 'flex';
//       rowDiv.style.justifyContent = 'space-between';
//       rowDiv.style.marginBottom = '20px'; // Optional spacing between rows

//       // Add up to 4 event cards in this row
//       for (let c = 0; c < columns; c++) {
//         const eventIndex = r * columns + c;
//         if (eventIndex >= data.events.length) break;

//         const event = data.events[eventIndex];
//         const eventCard = document.createElement('div');
//         eventCard.className = 'category-card';
//         eventCard.style.flexBasis = '23%'; // roughly 4 cards per row with spacing
//         eventCard.style.cursor = 'pointer';
//         eventCard.onclick = () => window.location.href = `/event/${event._id}`;

//         eventCard.innerHTML = `
//           <img src="${event.image ? (event.image.includes('/uploads/') ? event.image.replace('/uploads/', '/') : event.image) : '/uploads/events/default-event.png'}" alt="${event.title}" />
//           <p>${event.title}</p>
//         `;

//         rowDiv.appendChild(eventCard);
//       }
//       container.appendChild(rowDiv);
//     }

//     renderPagination(data.currentPage, data.totalPages);
//   } catch (error) {
//     console.error('Error loading events:', error);
//   }
// }

// function renderPagination(currentPage, totalPages) {
//   const paginationList = document.querySelector('.pagination-list');
//   if (!paginationList) return;
//   paginationList.innerHTML = '';

//   if (currentPage > 1) {
//     const prevLi = document.createElement('li');
//     const prevLink = document.createElement('a');
//     prevLink.href = '#';
//     prevLink.textContent = '«';
//     prevLink.addEventListener('click', e => {
//       e.preventDefault();
//       loadEvents(currentPage - 1);
//     });
//     prevLi.appendChild(prevLink);
//     paginationList.appendChild(prevLi);
//   } else {
//     const prevLi = document.createElement('li');
//     prevLi.className = 'disabled';
//     prevLi.innerHTML = '<span>«</span>';
//     paginationList.appendChild(prevLi);
//   }

//   for (let i = 1; i <= totalPages; i++) {
//     const li = document.createElement('li');
//     li.className = (i === currentPage) ? 'active' : '';
//     const a = document.createElement('a');
//     a.href = '#';
//     a.textContent = i;
//     a.addEventListener('click', e => {
//       e.preventDefault();
//       loadEvents(i);
//     });
//     li.appendChild(a);
//     paginationList.appendChild(li);
//   }

//   if (currentPage < totalPages) {
//     const nextLi = document.createElement('li');
//     const nextLink = document.createElement('a');
//     nextLink.href = '#';
//     nextLink.textContent = '»';
//     nextLink.addEventListener('click', e => {
//       e.preventDefault();
//       loadEvents(currentPage + 1);
//     });
//     nextLi.appendChild(nextLink);
//     paginationList.appendChild(nextLi);
//   } else {
//     const nextLi = document.createElement('li');
//     nextLi.className = 'disabled';
//     nextLi.innerHTML = '<span>»</span>';
//     paginationList.appendChild(nextLi);
//   }
// }

// window.addEventListener('DOMContentLoaded', () => loadEvents(1));

async function loadEvents(page = 1) {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);

    const response = await fetch('/api/events?' + params.toString());
    if (!response.ok) throw new Error('Failed to fetch events');

    const data = await response.json();

    const container = document.getElementById('event-list');
    container.innerHTML = '';

    if (data.events.length === 0) {
      container.innerHTML = '<p>No events found.</p>';
      return;
    }

    data.events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'category-card';
      eventCard.onclick = () => window.location.href = `/event/${event._id}`;
      eventCard.innerHTML = `
        <img src="${event.image ? (event.image.includes('/uploads/') ? event.image.replace('/uploads/', '/') : event.image) : '/uploads/events/default-event.png'}"
          alt="${event.title}">
        <p>${event.title}</p>
      `;
      container.appendChild(eventCard);
    });

    renderPagination(data.currentPage, data.totalPages);

  } catch (error) {
    console.error('Error loading events:', error);
  }
}

function renderPagination(currentPage, totalPages) {
  const paginationList = document.querySelector('.pagination-list');
  paginationList.innerHTML = '';

  if (currentPage > 1) {
    const prevLi = document.createElement('li');
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '«';
    prevLink.addEventListener('click', e => {
      e.preventDefault();
      loadEvents(currentPage - 1);
    });
    prevLi.appendChild(prevLink);
    paginationList.appendChild(prevLi);
  } else {
    const prevLi = document.createElement('li');
    prevLi.className = 'disabled';
    prevLi.innerHTML = '<span>«</span>';
    paginationList.appendChild(prevLi);
  }

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = (i === currentPage) ? 'active' : '';
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = i;
    a.addEventListener('click', e => {
      e.preventDefault();
      loadEvents(i);
    });
    li.appendChild(a);
    paginationList.appendChild(li);
  }

  if (currentPage < totalPages) {
    const nextLi = document.createElement('li');
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.textContent = '»';
    nextLink.addEventListener('click', e => {
      e.preventDefault();
      loadEvents(currentPage + 1);
    });
    nextLi.appendChild(nextLink);
    paginationList.appendChild(nextLi);
  } else {
    const nextLi = document.createElement('li');
    nextLi.className = 'disabled';
    nextLi.innerHTML = '<span>»</span>';
    paginationList.appendChild(nextLi);
  }
}

window.addEventListener('DOMContentLoaded', () => loadEvents(1));