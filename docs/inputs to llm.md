for the mvp i only want to focus on all the possible scenarios for creating an expense by the employee. here are some:

1. employee takes a photo or fill any details in the expense form and save it as draft. closing the expense modal: photo gets deleted immidietly.
2. employee fills amount and manager email and submits for pre approval
3. when an expense is preapproved, employee edits it and adds receipts/photos/pdfs
4. when employee want he can submit the expense for approval
5. an expense can have multiple managers in the future so plan for that. but required fields are only amound & dates for each line item.
6. employee can delete the whole expense or any line item withing the expense only before the approved state. files attached to each line item are deleted immidietely.
7. if the employee is part of an org then the manager email input should behave as an autocomplete field. if the employee is not part of any org then on entering the email we should check whether that email exists in our system or not.
8. an user can create expense without a manager and save them as draft and not send it for approval ever. these are there private expense they want to keep.

let me know if can think of more scenarios or if you have any challenges/questions to these requirements.

// Constitution

the project needs to follow best practices for react, nextjs, mongo. it should follow the following principles:

- always follow dry principle. create common components, hooks, utils, etc. never repeat.
- always create common components and hooks that contains the complete user action. for example: CreateArticleButton should contain the button code + modal code for creating the artical + api calls etc. so the button can be copy pasted at multiple places.
- no native fetch calls allowed. always use tanstack query.
- no custom components allowed without asking the user. always use shadcn and its registeries for components.
- always maintain empty, loading, error state for every page/section/modal.
- always check what should happen when an action is successful. for example: on creating an article, loading is shown on the button, a toast is shown on success/error, articles list is updated on success, etc.
- no server actions. always create generic reusable rest apis that follows best practices.
- no shortcuts allowed in code. the code should be ideal, readable and maintainable.
- divide tasks in logical blocks and run lint then build after completing each block.

Make it something Steve Jobs and Jony Ive would approve. Apple-level aesthetics.
