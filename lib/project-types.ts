// Нийтлэлийн мэдээллийн хэлбэр. mn = монгол, en = англи.
export type Project = {
  id: string;
  titleMn: string;
  titleEn: string;
  summaryMn: string;
  summaryEn: string;
  contentMn: string;
  contentEn: string;
  technologies: string;
  imageKey: string;
  githubUrl: string;
  demoUrl: string;
  published: number;
  createdAt: string;
  updatedAt: string;
};
export const exampleProject: Project = {
  id: "portfolio-preview",
  titleMn: "Тал нутгаас эхэлсэн портфолио",
  titleEn: "A portfolio rooted in the steppe",
  summaryMn:
    "Монгол төрх, хоёр хэл, төслийн тэмдэглэл. Энэхүү сайтын бүтцийг танилцуулах жишээ нийтлэл.",
  summaryEn:
    "Mongolian identity, two languages, and project stories. An example article introducing this website.",
  contentMn:
    "Энэ бол загварыг танилцуулах жишээ нийтлэл. Бодит төслөө нийтэлмэгц нүүр хуудсан дээр түүгээр солигдоно.\n\nЗорилго\nӨөрийгөө танилцуулах, хийсэн ажлаа зураг болон тайлбартай хуваалцах портфолио бүтээх.\n\nХийц\nReact компонентууд нь толгой хэсэг, төслийн карт, нийтлэл болон удирдлагын хэсгийг тус тус хариуцна. Хэлний сонголтыг React context-оор хуваалцана. Нийтлэлүүд серверийн өгөгдлийн санд хадгалагдана.\n\nСуралцах зүйл\nКомпонент, state, form, API хүсэлт, SQL болон сервер талын эрхийн шалгалт хэрхэн хамт ажилладгийг эх кодоос үзээрэй.",
  contentEn:
    "This is an example article to demonstrate the layout. It is replaced on the homepage when you publish your first real project.\n\nThe goal\nBuild a personal portfolio to introduce myself and share the story behind each project.\n\nThe structure\nReact components handle navigation, project cards, articles and the editor. React context shares the selected language. Articles are stored in a server database.\n\nWhat to learn\nExplore how components, state, forms, API requests, SQL and server-side authorization work together in the source code.",
  technologies: "React, CSS, SQL",
  imageKey: "",
  githubUrl: "",
  demoUrl: "",
  published: 1,
  createdAt: "",
  updatedAt: "",
};
