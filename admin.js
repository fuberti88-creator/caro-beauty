const SUPABASE_URL = "https://ehxqgrhpgizekwbqrdwp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sYXKhTNj_j6sSGSZkwNkAg_i1P5UAGO";

const EMAIL_ADMIN = "fuberti88@gmail.com";
const SENHA_ADMIN = "caro-beauty123";

let supabaseClient = null;
let produtoEditando = null;


// ======================================================
// INICIALIZAÇÃO
// ======================================================

async function iniciarSupabase() {
    if (supabaseClient) return supabaseClient;

    if (!window.supabase) {
        await carregarBibliotecaSupabase();
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    return supabaseClient;
}


function carregarBibliotecaSupabase() {
    return new Promise((resolve, reject) => {

        const script = document.createElement("script");

        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
    });
}


// ======================================================
// LOGIN
// ======================================================

async function entrarAdmin() {

    const senhaInput = document.getElementById("senhaAdmin");

    if (!senhaInput) return;

    const senha = senhaInput.value.trim();

    if (!senha) {
        alert("Digite a senha.");
        return;
    }

    try {

        const supabase = await iniciarSupabase();

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: EMAIL_ADMIN,
                password: senha
            });

        if (error) {
            console.error("Erro no login:", error);
            alert("Senha incorreta ou erro ao entrar.");
            return;
        }

        if (!data.session) {
            alert("Não foi possível iniciar a sessão.");
            return;
        }

        document.getElementById("telaLogin").style.display = "none";
        document.getElementById("painelAdmin").style.display = "block";

        await carregarProdutos();

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao conectar ao Supabase.");

    }
}


// ======================================================
// VERIFICAR SESSÃO
// ======================================================

async function verificarSessao() {

    try {

        const supabase = await iniciarSupabase();

        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (session) {

            document.getElementById("telaLogin").style.display = "none";
            document.getElementById("painelAdmin").style.display = "block";

            await carregarProdutos();

        }

    } catch (erro) {

        console.error("Erro ao verificar sessão:", erro);

    }
}


// ======================================================
// SAIR
// ======================================================

async function sairAdmin() {

    try {

        const supabase = await iniciarSupabase();

        await supabase.auth.signOut();

        document.getElementById("painelAdmin").style.display = "none";
        document.getElementById("telaLogin").style.display = "block";

        const senha = document.getElementById("senhaAdmin");

        if (senha) {
            senha.value = "";
        }

    } catch (erro) {

        console.error("Erro ao sair:", erro);

    }
}


// ======================================================
// CARREGAR PRODUTOS
// ======================================================

async function carregarProdutos() {

    try {

        const supabase = await iniciarSupabase();

        const { data, error } = await supabase
            .from("produtos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar produtos:", error);
            alert("Não foi possível carregar os produtos.");
            return;
        }

        mostrarProdutos(data || []);

    } catch (erro) {

        console.error("Erro:", erro);

    }
}


// ======================================================
// MOSTRAR PRODUTOS NO ADMIN
// ======================================================

function mostrarProdutos(produtos) {

    const lista = document.getElementById("listaProdutosAdmin");

    if (!lista) return;

    lista.innerHTML = "";

    if (!produtos.length) {

        lista.innerHTML = `
            <p style="text-align:center;">
                Nenhum produto cadastrado.
            </p>
        `;

        return;
    }

    produtos.forEach(produto => {

        const item = document.createElement("div");

        item.className = "produto-admin";

        const imagem = produto.imagem_url
            ? `<img src="${produto.imagem_url}" alt="${escaparHTML(produto.nome)}">`
            : "";

        item.innerHTML = `

            <div class="imagem-admin">
                ${imagem}
            </div>

            <div class="dados-produto-admin">

                <h3>${escaparHTML(produto.nome)}</h3>

                <p>
                    ${escaparHTML(produto.descricao || "")}
                </p>

                <strong>
                    R$ ${formatarPreco(produto.preco)}
                </strong>

                <span>
                    Categoria: ${escaparHTML(produto.categoria || "")}
                </span>

                <span>
                    Estoque:
                    <strong>
                        ${produto.estoque ? "Disponível" : "Indisponível"}
                    </strong>
                </span>

            </div>

            <div class="acoes-produto-admin">

                <button
                    type="button"
                    onclick="editarProduto(${produto.id})">
                    EDITAR
                </button>

                <button
                    type="button"
                    onclick="alternarEstoque(${produto.id}, ${produto.estoque})">
                    ${produto.estoque ? "DESATIVAR ESTOQUE" : "ATIVAR ESTOQUE"}
                </button>

                <button
                    type="button"
                    onclick="excluirProduto(${produto.id})">
                    EXCLUIR
                </button>

            </div>
        `;

        lista.appendChild(item);

    });
}


// ======================================================
// ABRIR FORMULÁRIO
// ======================================================

function abrirFormularioProduto() {

    produtoEditando = null;

    const formulario = document.getElementById("formularioProduto");
    const form = document.getElementById("formProduto");

    if (!formulario || !form) return;

    form.reset();

    formulario.style.display = "block";

    const titulo = formulario.querySelector("h2");

    if (titulo) {
        titulo.textContent = "Novo Produto";
    }
}


// ======================================================
// FECHAR FORMULÁRIO
// ======================================================

function fecharFormularioProduto() {

    produtoEditando = null;

    const formulario = document.getElementById("formularioProduto");

    if (formulario) {
        formulario.style.display = "none";
    }

    const form = document.getElementById("formProduto");

    if (form) {
        form.reset();
    }
}


// ======================================================
// EDITAR PRODUTO
// ======================================================

async function editarProduto(id) {

    try {

        const supabase = await iniciarSupabase();

        const { data, error } = await supabase
            .from("produtos")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {

            console.error("Erro ao buscar produto:", error);

            alert("Não foi possível abrir o produto.");

            return;
        }

        produtoEditando = data;

        document.getElementById("nomeProduto").value =
            data.nome || "";

        document.getElementById("descricaoProduto").value =
            data.descricao || "";

        document.getElementById("precoProduto").value =
            data.preco || "";

        document.getElementById("categoriaProduto").value =
            data.categoria || "";

        document.getElementById("estoqueProduto").value =
            data.estoque ? "true" : "false";

        const formulario =
            document.getElementById("formularioProduto");

        formulario.style.display = "block";

        const titulo = formulario.querySelector("h2");

        if (titulo) {
            titulo.textContent = "Editar Produto";
        }

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao abrir produto.");

    }
}


// ======================================================
// SALVAR PRODUTO
// ======================================================

async function salvarProduto(event) {

    event.preventDefault();

    const nome =
        document.getElementById("nomeProduto").value.trim();

    const descricao =
        document.getElementById("descricaoProduto").value.trim();

    const preco =
        document.getElementById("precoProduto").value;

    const categoria =
        document.getElementById("categoriaProduto").value;

    const estoque =
        document.getElementById("estoqueProduto").value === "true";

    const imagemInput =
        document.getElementById("imagemProduto");

    if (!nome) {

        alert("Digite o nome do produto.");

        return;
    }

    if (!preco) {

        alert("Digite o preço do produto.");

        return;
    }

    try {

        const supabase = await iniciarSupabase();

        // Verifica se existe sessão do Supabase
        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session) {

            alert(
                "Sua sessão expirou. Entre novamente no Admin."
            );

            document.getElementById("painelAdmin").style.display = "none";
            document.getElementById("telaLogin").style.display = "block";

            return;
        }

        let imagemURL = produtoEditando
            ? produtoEditando.imagem_url
            : "";

        // Se foi escolhida uma nova imagem
        if (
            imagemInput &&
            imagemInput.files &&
            imagemInput.files.length > 0
        ) {

            imagemURL =
                await converterImagem(imagemInput.files[0]);

        }

        const produto = {

            nome: nome,

            descricao: descricao,

            preco: Number(preco),

            categoria: categoria,

            imagem_url: imagemURL,

            estoque: estoque

        };


        // --------------------------------------------------
        // EDITAR
        // --------------------------------------------------

        if (produtoEditando) {

            const { error } = await supabase
                .from("produtos")
                .update(produto)
                .eq("id", produtoEditando.id);

            if (error) {

                console.error("Erro ao editar:", error);

                alert(
                    "Não foi possível atualizar o produto."
                );

                return;
            }

            alert("Produto atualizado com sucesso!");

        }

        // --------------------------------------------------
        // NOVO PRODUTO
        // --------------------------------------------------

        else {

            const { error } = await supabase
                .from("produtos")
                .insert([produto]);

            if (error) {

                console.error("Erro ao salvar:", error);

                alert(
                    "Não foi possível salvar o produto."
                );

                return;
            }

            alert("Produto cadastrado com sucesso!");

        }


        fecharFormularioProduto();

        await carregarProdutos();


    } catch (erro) {

        console.error("Erro ao salvar:", erro);

        alert("Ocorreu um erro ao salvar o produto.");

    }
}


// ======================================================
// ESTOQUE
// ======================================================

async function alternarEstoque(id, estoqueAtual) {

    const confirmar = confirm(
        estoqueAtual
            ? "Deseja deixar este produto sem estoque?"
            : "Deseja ativar o estoque deste produto?"
    );

    if (!confirmar) return;

    try {

        const supabase = await iniciarSupabase();

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session) {

            alert("Sua sessão expirou. Entre novamente.");

            return;
        }

        const { error } = await supabase
            .from("produtos")
            .update({
                estoque: !estoqueAtual
            })
            .eq("id", id);

        if (error) {

            console.error("Erro no estoque:", error);

            alert(
                "Não foi possível alterar o estoque."
            );

            return;
        }

        await carregarProdutos();

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao alterar estoque.");

    }
}


// ======================================================
// EXCLUIR PRODUTO
// ======================================================

async function excluirProduto(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) return;

    try {

        const supabase = await iniciarSupabase();

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session) {

            alert("Sua sessão expirou. Entre novamente.");

            return;
        }

        const { error } = await supabase
            .from("produtos")
            .delete()
            .eq("id", id);

        if (error) {

            console.error("Erro ao excluir:", error);

            alert(
                "Não foi possível excluir o produto."
            );

            return;
        }

        alert("Produto excluído com sucesso!");

        await carregarProdutos();

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao excluir produto.");

    }
}


// ======================================================
// CONVERTER IMAGEM PARA BASE64
// ======================================================

function converterImagem(arquivo) {

    return new Promise((resolve, reject) => {

        const leitor = new FileReader();

        leitor.onload = () => {
            resolve(leitor.result);
        };

        leitor.onerror = () => {
            reject(leitor.error);
        };

        leitor.readAsDataURL(arquivo);

    });
}


// ======================================================
// FORMATAR PREÇO
// ======================================================

function formatarPreco(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


// ======================================================
// PROTEGER HTML
// ======================================================

function escaparHTML(texto) {

    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// INICIAR
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await iniciarSupabase();

        await verificarSessao();

    }
);
