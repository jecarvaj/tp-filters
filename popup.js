document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('#filter-form input[type="checkbox"]')

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const filters = {}

      checkboxes.forEach(cb => {
        filters[cb.id] = cb.checked
      })

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: applyFilters,
          args: [filters]
        })
      })
    })
  })

  document.querySelectorAll('.toggle-all').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const checkboxes = event.target.closest('fieldset').querySelectorAll('input[type="checkbox"]');
      const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
      checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked
        checkbox.dispatchEvent(new Event('change'))
      });
    });
  });
})

function applyFilters(filters) {
  const mapping = {
    filterCheckboxCreated: 'Created',
    filterCheckboxRedacted: 'Redacted',
    filterCheckboxApproved: 'Approved',
    filterCheckboxQueued: 'Queued',
    filterCheckboxQueuedQAReturned: 'Queued QA Returned',
    filterCheckboxInProgress: 'In Progress',
    filterCheckboxCodeReview: 'Code Review',
    filterCheckboxQueuedQA: 'Queued QA',
    filterCheckboxInProgressQA: 'In Progress QA',
    filterCheckboxDoneQA: 'Done QA',
    filterCheckboxMerged: 'Merged',
    filterCheckboxDeployedOrClosed: 'Deployed or Closed'
  }

  const activeStates = Object.entries(filters)
    .filter(([_, isChecked]) => isChecked)
    .map(([checkboxId]) => mapping[checkboxId])

  document.querySelectorAll('.i-card-role.i-role-card.tau-list-entity').forEach(element => {
    const dataItem = JSON.parse(element.getAttribute('data-data-item'))
    const state = dataItem?.data?.state_full_length?.projectState

    element.style.display = activeStates.length === 0 || activeStates.includes(state) ? 'block' : 'none'
  })
}
