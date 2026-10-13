# Open questions

Unresolved questions that affect design. AI agents: do not guess answers to these; flag them.

| #   | Question                                                                                                                                           | Affects                            | Owner | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----- | ------ |
| Q1  | Where will this be hosted (Azure / AWS / on-prem)?                                                                                                 | Deployment, storage, DB            |       | Open   |
| Q2  | Which SSO / identity provider?                                                                                                                     | Auth, `UserRef`                    |       | Open   |
| Q3  | Does R2S have an API? Can we get an image + viewpoint (position, heading, pitch, FOV)? Deep-link format?                                           | `R2sViewpoint`, phase 4            |       | Open   |
| Q4  | Do several people edit the same jobcard at the same time?                                                                                          | Real-time collab vs locking        |       | Open   |
| Q5  | Is any editing done offshore with limited connectivity?                                                                                            | Offline support                    |       | Open   |
| Q6  | Exact list of metadata fields on the current template (and which are mandatory)?                                                                   | `Jobcard` schema, PDF              |       | Open   |
| Q7  | Job number / revision numbering scheme? Generated or entered by user?                                                                              | `Jobcard` schema                   |       | Open   |
| Q8  | What does a workpack PDF contain besides jobcards (cover, index, revision history)?                                                                | Workpack PDF                       |       | Open   |
| Q9  | Who owns and approves the 25 content templates?                                                                                                    | Template process                   |       | Open   |
| Q10 | Data classification of jobcards and images (confidentiality, retention)?                                                                           | Hosting, storage                   |       | Open   |
| Q11 | Who maintains the system long term?                                                                                                                | Tech choices, ops                  |       | Open   |
| Q12 | Wireframes call the items inside a jobcard "activities" (shown in the tree). Is an activity the same as the domain "step", or a grouping of steps? | `Jobcard` schema, `docs/domain.md` |       | Open   |
