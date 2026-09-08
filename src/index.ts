export default {
  async fetch() {
    console.info({ message: "Worker received a request!" });

    return new Response("Hello Solid World!");
  },
};
