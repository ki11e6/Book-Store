# BOOK STORE

some note:
CSRF - Cross-site request forgery

- all post requests form should
  `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`
