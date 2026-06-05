document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build elements for the card to avoid unsafe HTML injection
        const title = document.createElement('h4');
        title.textContent = name;

        const desc = document.createElement('p');
        desc.textContent = details.description;

        const scheduleP = document.createElement('p');
        scheduleP.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availP = document.createElement('p');
        availP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        // Participants block
        let participantsBlock;
        if (details.participants && details.participants.length > 0) {
          participantsBlock = document.createElement('div');
          participantsBlock.className = 'participants';

          const label = document.createElement('strong');
          label.textContent = 'Participants:';
          participantsBlock.appendChild(label);

          const ul = document.createElement('ul');
          ul.className = 'participants-list';

          details.participants.forEach(email => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const span = document.createElement('span');
            span.className = 'participant-email';
            span.textContent = email;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'participant-delete';
            btn.title = `Remove ${email}`;
            btn.dataset.activity = name;
            btn.dataset.email = email;
            btn.textContent = '✖';

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          participantsBlock.appendChild(ul);
        } else {
          participantsBlock = document.createElement('p');
          participantsBlock.className = 'no-participants';
          participantsBlock.innerHTML = '<em>No participants yet</em>';
        }

        // Append parts to card
        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availP);
        activityCard.appendChild(participantsBlock);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
      
        // Delegate delete clicks for participant removal
        activitiesList.addEventListener('click', async (e) => {
          const el = e.target;
          if (!el.classList || !el.classList.contains('participant-delete')) return;

          const activity = el.dataset.activity;
          const email = el.dataset.email;

          try {
            const resp = await fetch(`/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`, {
              method: 'DELETE'
            });
            const result = await resp.json();

            if (resp.ok) {
              messageDiv.textContent = result.message;
              messageDiv.className = 'success';
              // Refresh the activities list to reflect the change
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || 'Failed to remove participant';
              messageDiv.className = 'error';
            }
          } catch (err) {
            console.error('Error removing participant:', err);
            messageDiv.textContent = 'Failed to remove participant';
            messageDiv.className = 'error';
          }

          messageDiv.classList.remove('hidden');
          setTimeout(() => messageDiv.classList.add('hidden'), 4000);
        });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities to show the new participant without page reload
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
