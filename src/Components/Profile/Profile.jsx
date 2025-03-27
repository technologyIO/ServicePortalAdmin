import React from "react";

function Profile() {
  return (
    <div>
      <div class="w-full max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div class="grid md:grid-cols-[300px_1fr] gap-8">
          <div class="flex flex-col items-center gap-6">
            <div class="relative w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden">
              <img
                alt="User Profile"
                width="200"
                height="200"
                class="object-cover w-full h-full"
                src="https://static.vecteezy.com/system/resources/previews/005/346/410/non_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg"
                // style="aspect-ratio: 200 / 200; object-fit: cover;"
                style={{aspectRatio:"200/200", objectFit:"cover"}}
              />
              <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 w-10 absolute bottom-2 right-2 bg-background/80 hover:bg-background">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="w-5 h-5"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
                <span class="sr-only">Change profile picture</span>
              </button>
            </div>
            <div class="grid gap-1 text-center">
              <h1 class="text-2xl font-bold">John Doe</h1>
              <p class="text-muted-foreground">Software Engineer</p>
            </div>
          </div>
          <div class="grid gap-8">
            <div class="grid gap-4">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">Profile</h2>
                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-4 h-4 mr-2"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                  Edit
                </button>
              </div>
              <div class="grid gap-2 text-muted-foreground">
                <div class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-5 h-5"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span>john@example.com</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-5 h-5"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                    <path d="M8 14h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M16 18h.01"></path>
                  </svg>
                  <span>Joined in 2021</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-5 h-5"
                  >
                    <line x1="2" x2="5" y1="12" y2="12"></line>
                    <line x1="19" x2="22" y1="12" y2="12"></line>
                    <line x1="12" x2="12" y1="2" y2="5"></line>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                    <circle cx="12" cy="12" r="7"></circle>
                  </svg>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <div class="grid gap-4">
              <h2 class="text-xl font-semibold">About</h2>
              <div class="prose text-muted-foreground">
                <p>
                  John Doe is a software engineer with a passion for building
                  innovative and user-friendly applications. He has over 5 years
                  of experience in the industry, working with a variety of
                  technologies and frameworks.
                </p>
                <p>
                  In his free time, John enjoys exploring the great outdoors,
                  reading, and learning new skills. He is also an active
                  contributor to open-source projects and enjoys collaborating
                  with other developers.
                </p>
              </div>
            </div>
            <div class="grid gap-4">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">Skills</h2>
                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-4 h-4 mr-2"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                  Edit
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <div>React</div>
                <div>JavaScript</div>
                <div>Node.js</div>
                <div>TypeScript</div>
                <div>CSS</div>
                <div>Git</div>
                <div>SQL</div>
              </div>
            </div>
            <div class="grid gap-4">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">Experience</h2>
                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-4 h-4 mr-2"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                  </svg>
                  Edit
                </button>
              </div>
              <div class="grid gap-6">
                <div class="grid gap-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold">Software Engineer</h3>
                      <p class="text-muted-foreground">
                        Acme Inc. - 2019 to present
                      </p>
                    </div>
                    <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="w-4 h-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                      <span class="sr-only">Edit experience</span>
                    </button>
                  </div>
                  <div class="prose text-muted-foreground">
                    <p>
                      Responsible for developing and maintaining web
                      applications using React, Node.js, and other modern
                      technologies. Collaborated with cross-functional teams to
                      deliver high-quality software solutions.
                    </p>
                  </div>
                </div>
                <div class="grid gap-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold">Intern</h3>
                      <p class="text-muted-foreground">
                        Acme Inc. - Summer 2018
                      </p>
                    </div>
                    <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="w-4 h-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                      <span class="sr-only">Edit experience</span>
                    </button>
                  </div>
                  <div class="prose text-muted-foreground">
                    <p>
                      Participated in a summer internship program, where I
                      gained hands-on experience in web development and software
                      engineering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
