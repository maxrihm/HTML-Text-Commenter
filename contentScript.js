// contentScript.js

(function () {
  let comments = [];

  // Create the floating menu
  const menu = document.createElement('div');
  menu.id = 'floating-menu';
  menu.innerHTML = `
    <div id="menu-header">Comments Manager
      <button id="toggle-menu">▼</button>
    </div>
    <div id="comments-container">
      <ul id="comments-list"></ul>
    </div>
    <div id="menu-actions">
      <button id="copy-comments">Copy All Comments</button>
      <button id="delete-comments">Delete All Comments</button>
    </div>
  `;
  document.body.appendChild(menu);

  // Toggle menu visibility
  const toggleButton = document.getElementById('toggle-menu');
  const commentsContainer = document.getElementById('comments-container');
  toggleButton.addEventListener('click', () => {
    if (commentsContainer.style.display === 'none') {
      commentsContainer.style.display = 'block';
      toggleButton.textContent = '▼';
    } else {
      commentsContainer.style.display = 'none';
      toggleButton.textContent = '▲';
    }
  });

  // Add event listeners
  document.addEventListener('keydown', handleKeyDown);
  document.getElementById('copy-comments').addEventListener('click', copyAllComments);
  document.getElementById('delete-comments').addEventListener('click', deleteAllComments);

  // Handle Ctrl+Y keypress
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleTextSelection();
    }
  }

  function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
      addCommentEntry(selectedText);
      selection.removeAllRanges(); // Clear selection
    } else {
      alert('Please select some text before pressing Ctrl+Y.');
    }
  }

  function addCommentEntry(selectedText) {
    const commentEntry = {
      text: selectedText,
      comment: ''
    };
    comments.push(commentEntry);
    renderComments();
  }

  function renderComments() {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';

    comments.forEach((entry, index) => {
      const commentItem = document.createElement('li');
      commentItem.className = 'comment-item';
      commentItem.draggable = true;

      // Drag-and-drop handlers
      commentItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', index);
        e.dropEffect = 'move';
      });

      commentItem.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      commentItem.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData('text/plain');
        const targetIndex = index;
        moveComment(draggedIndex, targetIndex);
      });

      // Comment Number
      const commentNumber = document.createElement('div');
      commentNumber.className = 'comment-number';
      commentNumber.textContent = `Comment ${index + 1}`;

      // Separator
      const separator = document.createElement('hr');
      separator.className = 'comment-separator';

      // Selected Text Label and Input
      const textLabel = document.createElement('label');
      textLabel.className = 'text-label';
      textLabel.textContent = 'Selected Text:';

      const textInput = document.createElement('textarea');
      textInput.className = 'selected-text';
      textInput.value = entry.text;
      textInput.addEventListener('input', (e) => {
        comments[index].text = e.target.value;
      });

      // Comment Label and Input
      const commentLabel = document.createElement('label');
      commentLabel.className = 'comment-label';
      commentLabel.textContent = 'Comment:';

      const commentInput = document.createElement('textarea');
      commentInput.className = 'comment-input';
      commentInput.placeholder = 'Enter your comment...';
      commentInput.value = entry.comment;
      commentInput.addEventListener('input', (e) => {
        comments[index].comment = e.target.value;
      });

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        comments.splice(index, 1);
        renderComments();
      });

      // Append elements
      commentItem.appendChild(commentNumber);
      commentItem.appendChild(separator);
      commentItem.appendChild(textLabel);
      commentItem.appendChild(textInput);
      commentItem.appendChild(commentLabel);
      commentItem.appendChild(commentInput);
      commentItem.appendChild(deleteBtn);
      commentsList.appendChild(commentItem);
    });
  }

  function moveComment(fromIndex, toIndex) {
    const movedItem = comments.splice(fromIndex, 1)[0];
    comments.splice(toIndex, 0, movedItem);
    renderComments();
  }

  function copyAllComments() {
    if (comments.length === 0) {
      alert('No comments to copy.');
      return;
    }
    const commentTexts = comments.map((entry, index) => `Comment ${index + 1}\nSelected Text: ${entry.text}\nComment: ${entry.comment}`).join('\n\n');
    navigator.clipboard.writeText(commentTexts).then(() => {
      alert('Comments copied to clipboard.');
    });
  }

  function deleteAllComments() {
    if (comments.length === 0) {
      alert('No comments to delete.');
      return;
    }
    if (confirm('Are you sure you want to delete all comments?')) {
      comments = [];
      renderComments();
    }
  }
})();
