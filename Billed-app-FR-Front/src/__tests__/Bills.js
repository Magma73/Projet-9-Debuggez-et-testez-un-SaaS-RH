/**
 * @jest-environment jsdom
 */
// debugger;

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

beforeEach(() => {
   Object.defineProperty(window, "localStorage", { value: localStorageMock });
   window.localStorage.setItem(
      "user",
      JSON.stringify({
         type: "Employee",
         email: "employee@test.tld",
         status: "connected",
      })
   );
   const root = document.createElement("div");
   root.setAttribute("id", "root");
   document.body.append(root);
   router();
   window.onNavigate(ROUTES_PATH.Bills);
});

afterEach(() => {
   jest.clearAllMocks();
});

describe("Given I am connected as an employee", () => {
   describe("When I am on Bills page, I click on the icon eye", () => {
      test("Then a modal should appear", async () => {
         await waitFor(() => screen.getAllByTestId("icon-eye"));
         const eye = screen.getAllByTestId("icon-eye");

         const firstEye = eye[0];
         $.fn.modal = jest.fn();

         userEvent.click(firstEye);

         const dialog = await screen.findByRole("dialog", { hidden: true });
         expect(dialog).toBeTruthy();
      });
   });

   describe("When I am on Bills page, I click on the button New Bill", () => {
      test("Then, should render the Add a New Bill Page", async () => {
         await waitFor(() => screen.getByTestId("btn-new-bill"));
         const btn = screen.getByTestId("btn-new-bill");
         userEvent.click(btn);
         expect(await screen.findByText("Envoyer une note de frais")).toBeTruthy();
      });
      test("Then mail icon in vertical layout should be highlighted", async () => {
         document.location = "/#employee/bill/new";
         await router();
         await waitFor(() => screen.getByTestId("icon-mail"));
         const windowIcon = screen.getByTestId("icon-mail");
         expect(windowIcon.classList.contains("active-icon")).toBe(true);
      });
   });
});

// test d'intégration GET
describe("Given I am a user connected as an employee", () => {
   describe("WWhen I am on Bills page", () => {
      test("Then fetches bills from mock API GET", async () => {
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.append(root);
         router();
         window.onNavigate(ROUTES_PATH.Bills);

         const dataMocked = jest.spyOn(mockStore.bills(), "list")
         mockStore.bills().list();

         await waitFor(() => {
            expect(dataMocked).toHaveBeenCalledTimes(1);
            expect(document.querySelectorAll("tbody tr").length).toBe(4);
            expect(screen.findByText("Mes notes de frais")).toBeTruthy();
         });
      });
      describe("When an error occurs on API", () => {
         beforeEach(() => {
            jest.spyOn(mockStore, "bills");
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
               "user",
               JSON.stringify({
                  type: "Employee",
                  email: "employee@test.tld",
                  status: "connected",
               })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
         });
         test("Then fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  list: () => {
                     return Promise.reject(new Error("Erreur 404"));
                  },
               };
            });
            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
         });

         test("Then fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  list: () => {
                     return Promise.reject(new Error("Erreur 500"));
                  },
               };
            });

            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
         });
      });
   });
});
